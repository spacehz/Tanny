import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { View, StyleSheet, FlatList, RefreshControl, Alert, TouchableOpacity } from 'react-native';
import { Text, Button, ActivityIndicator, Divider } from 'react-native-paper';
import { Calendar, DateData } from 'react-native-calendars';
import { useNavigation } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';

import { useAuth } from '../context/AuthContext';
import { useEvents } from '../hooks/useEvents';
import EventCard from '../components/EventCard';
import { colors } from '../constants/theme';

interface Event {
  _id: string;
  title: string;
  start: string;
  end: string;
  location: string;
  type: string;
  description: string;
  volunteers: string[];
  expectedVolunteers?: number;
  ExpectedVolunteers?: number; // Pour la rétrocompatibilité
}

interface MarkedDates {
  [date: string]: {
    marked: boolean;
    dotColor: string;
    selected?: boolean;
    selectedColor?: string;
  };
}

const EventsScreen = () => {
  const [selectedDate, setSelectedDate] = useState('');
  const [refreshing, setRefreshing] = useState(false);
  
  const { user } = useAuth();
  const navigation = useNavigation();
  
  // Utiliser le hook personnalisé pour les événements
  const { 
    events, 
    isLoading, 
    isError, 
    refetch, 
    filterEventsByDate, 
    getUpcomingEvents 
  } = useEvents();
  
  // Utiliser useMemo pour calculer les événements à venir
  const upcomingEvents = useMemo(() => {
    if (selectedDate) {
      return filterEventsByDate(selectedDate);
    }
    return getUpcomingEvents();
  }, [events, selectedDate, filterEventsByDate, getUpcomingEvents]);
  
  // Calculer les dates marquées pour le calendrier
  const markedDates = useMemo(() => {
    const marked: MarkedDates = {};
    
    if (events && Array.isArray(events)) {
      events.forEach(event => {
        const date = new Date(event.start).toISOString().split('T')[0];
        
        // Déterminer la couleur en fonction du type d'événement
        const dotColor = event.type?.toLowerCase().includes('marché') ? colors.secondary : colors.primary;
        
        marked[date] = {
          marked: true,
          dotColor,
          ...(date === selectedDate ? { selected: true, selectedColor: '#E0E0E0' } : {})
        };
      });
    }
    
    return marked;
  }, [events, selectedDate]);
  
  // Fonction pour rafraîchir les événements
  const onRefresh = useCallback(() => {
    setRefreshing(true);
    refetch().finally(() => setRefreshing(false));
  }, [refetch]);

  // Fonction pour gérer la sélection d'une date
  const handleDayPress = (day: DateData) => {
    setSelectedDate(day.dateString);
    
    // Filtrer les événements pour cette date
    const dateEvents = filterEventsByDate(day.dateString);
    
    if (dateEvents.length === 0) {
      // Si aucun événement pour cette date, afficher un message
      Alert.alert('Information', 'Aucun événement prévu pour cette date');
      
      // Réinitialiser la sélection pour revenir aux événements à venir
      setSelectedDate('');
    }
  };

  // Fonction pour naviguer vers les détails d'un événement
  const navigateToEventDetails = (event: Event) => {
    navigation.navigate('EventDetails' as never, { event } as never);
  };

  // Fonction pour formater la date
  const formatDate = (dateString: string) => {
    const options: Intl.DateTimeFormatOptions = { 
      weekday: 'long', 
      year: 'numeric', 
      month: 'long', 
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    };
    return new Date(dateString).toLocaleDateString('fr-FR', options);
  };

  // Fonction pour déterminer si l'utilisateur est inscrit à un événement
  const isUserRegistered = (event: Event) => {
    return event.volunteers && event.volunteers.includes(user?._id || '');
  };

  // Fonction pour déterminer la couleur en fonction du type d'événement
  const getEventColor = (type: string) => {
    if (!type) return colors.primary;
    
    const lowerType = type.toLowerCase();
    if (lowerType.includes('marché') || lowerType.includes('marche')) {
      return colors.secondary;
    }
    
    return colors.primary;
  };

  // Rendu d'un événement dans la liste
  const renderEventItem = ({ item }: { item: Event }) => {
    const registered = isUserRegistered(item);
    
    return (
      <EventCard 
        event={item}
        isUserRegistered={registered}
        onPress={() => navigateToEventDetails(item)}
      />
    );
  };

  return (
    <View style={styles.container}>
      <Calendar
        onDayPress={handleDayPress}
        markedDates={markedDates}
        theme={{
          todayTextColor: colors.primary,
          arrowColor: colors.primary,
          dotColor: colors.primary,
          selectedDayBackgroundColor: colors.primary,
        }}
      />
      
      <View style={styles.legendContainer}>
        <View style={styles.legendItem}>
          <View style={[styles.legendDot, { backgroundColor: colors.primary }]} />
          <Text>Collectes</Text>
        </View>
        <View style={styles.legendItem}>
          <View style={[styles.legendDot, { backgroundColor: colors.secondary }]} />
          <Text>Marchés</Text>
        </View>
      </View>
      
      <Divider style={styles.divider} />
      
      <Text style={styles.sectionTitle}>Événements à venir</Text>
      
      {isLoading ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={colors.primary} />
        </View>
      ) : isError ? (
        <View style={styles.emptyContainer}>
          <Text style={styles.emptyText}>Erreur lors du chargement des événements</Text>
          <Button mode="contained" onPress={onRefresh} style={{ marginTop: 10 }}>
            Réessayer
          </Button>
        </View>
      ) : (
        <FlatList
          data={upcomingEvents}
          keyExtractor={(item) => item._id}
          renderItem={renderEventItem}
          contentContainerStyle={styles.eventsList}
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
          }
          ListEmptyComponent={
            <View style={styles.emptyContainer}>
              <Text style={styles.emptyText}>
                {selectedDate ? 'Aucun événement pour cette date' : 'Aucun événement à venir'}
              </Text>
            </View>
          }
          // Optimisations de performance
          initialNumToRender={10}
          maxToRenderPerBatch={5}
          windowSize={5}
          removeClippedSubviews={true}
        />
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  legendContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    paddingVertical: 10,
  },
  legendItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginHorizontal: 10,
  },
  legendDot: {
    width: 12,
    height: 12,
    borderRadius: 6,
    marginRight: 6,
  },
  divider: {
    marginVertical: 8,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginVertical: 12,
    marginHorizontal: 16,
    color: '#333',
  },
  eventsList: {
    paddingHorizontal: 16,
    paddingBottom: 16,
  },
  emptyContainer: {
    padding: 20,
    alignItems: 'center',
  },
  emptyText: {
    fontSize: 16,
    color: '#666',
  },
});

export default EventsScreen;
