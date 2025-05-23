import React, { useState, useEffect, useCallback } from 'react';
import { View, StyleSheet, FlatList, RefreshControl, Alert, TouchableOpacity } from 'react-native';
import { Text, Card, Button, ActivityIndicator, Chip, Divider } from 'react-native-paper';
import { Calendar, DateData } from 'react-native-calendars';
import { useNavigation } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';

import { useAuth } from '../context/AuthContext';
import { getEvents } from '../services/eventService';
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
  ExpectedVolunteers: number;
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
  const [events, setEvents] = useState<Event[]>([]);
  const [upcomingEvents, setUpcomingEvents] = useState<Event[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [selectedDate, setSelectedDate] = useState('');
  const [markedDates, setMarkedDates] = useState<MarkedDates>({});
  
  const { user } = useAuth();
  const navigation = useNavigation();

  // Fonction pour charger les événements
  const loadEvents = useCallback(async () => {
    try {
      setLoading(true);
      const eventsData = await getEvents();
      
      if (Array.isArray(eventsData)) {
        setEvents(eventsData);
        
        // Filtrer les événements à venir
        const now = new Date();
        const upcoming = eventsData
          .filter(event => new Date(event.start) > now)
          .sort((a, b) => new Date(a.start).getTime() - new Date(b.start).getTime());
        
        setUpcomingEvents(upcoming);
        
        // Marquer les dates dans le calendrier
        const marked: MarkedDates = {};
        eventsData.forEach(event => {
          const date = new Date(event.start).toISOString().split('T')[0];
          
          // Déterminer la couleur en fonction du type d'événement
          const dotColor = event.type?.toLowerCase().includes('marché') ? colors.secondary : colors.primary;
          
          marked[date] = {
            marked: true,
            dotColor,
            ...(date === selectedDate ? { selected: true, selectedColor: '#E0E0E0' } : {})
          };
        });
        
        setMarkedDates(marked);
      }
    } catch (error) {
      console.error('Erreur lors du chargement des événements:', error);
      Alert.alert('Erreur', 'Impossible de charger les événements');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [selectedDate]);

  // Charger les événements au montage du composant
  useEffect(() => {
    loadEvents();
  }, [loadEvents]);

  // Fonction pour rafraîchir les événements
  const onRefresh = useCallback(() => {
    setRefreshing(true);
    loadEvents();
  }, [loadEvents]);

  // Fonction pour gérer la sélection d'une date
  const handleDayPress = (day: DateData) => {
    setSelectedDate(day.dateString);
    
    // Mettre à jour les dates marquées pour refléter la sélection
    const newMarkedDates = { ...markedDates };
    
    // Réinitialiser toutes les sélections précédentes
    Object.keys(newMarkedDates).forEach(date => {
      if (newMarkedDates[date].selected) {
        newMarkedDates[date] = {
          ...newMarkedDates[date],
          selected: false,
        };
      }
    });
    
    // Marquer la nouvelle date sélectionnée
    newMarkedDates[day.dateString] = {
      ...(newMarkedDates[day.dateString] || { marked: false, dotColor: colors.primary }),
      selected: true,
      selectedColor: '#E0E0E0',
    };
    
    setMarkedDates(newMarkedDates);
    
    // Filtrer les événements pour cette date
    const dateEvents = events.filter(event => {
      const eventDate = new Date(event.start).toISOString().split('T')[0];
      return eventDate === day.dateString;
    });
    
    if (dateEvents.length > 0) {
      setUpcomingEvents(dateEvents);
    } else {
      // Si aucun événement pour cette date, afficher un message
      Alert.alert('Information', 'Aucun événement prévu pour cette date');
      
      // Revenir à la liste des événements à venir
      const now = new Date();
      const upcoming = events
        .filter(event => new Date(event.start) > now)
        .sort((a, b) => new Date(a.start).getTime() - new Date(b.start).getTime());
      
      setUpcomingEvents(upcoming);
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
    const eventColor = getEventColor(item.type);
    const registered = isUserRegistered(item);
    
    // Calculer le nombre de places disponibles
    const totalVolunteersNeeded = item.ExpectedVolunteers || 5;
    const registeredVolunteers = item.volunteers?.length || 0;
    const availableSpots = Math.max(0, totalVolunteersNeeded - registeredVolunteers);
    const isFullyBooked = availableSpots <= 0;

    return (
      <Card style={styles.eventCard} onPress={() => navigateToEventDetails(item)}>
        <Card.Content>
          <View style={styles.eventHeader}>
            <View style={[styles.eventTypeIndicator, { backgroundColor: eventColor }]} />
            <Text style={styles.eventTitle}>{item.title}</Text>
            {registered && (
              <Chip style={styles.registeredChip} textStyle={{ color: colors.primary }}>
                Inscrit
              </Chip>
            )}
          </View>
          
          <Text style={styles.eventDate}>{formatDate(item.start)}</Text>
          
          <View style={styles.eventDetails}>
            <View style={styles.eventDetailRow}>
              <Ionicons name="location-outline" size={16} color="#666" />
              <Text style={styles.eventDetailText}>{item.location || 'Lieu non précisé'}</Text>
            </View>
            
            <View style={styles.eventDetailRow}>
              <Ionicons name="people-outline" size={16} color="#666" />
              <Text style={styles.eventDetailText}>
                {isFullyBooked ? (
                  <Text style={{ color: 'red' }}>Complet</Text>
                ) : (
                  `${availableSpots} places disponibles sur ${totalVolunteersNeeded}`
                )}
              </Text>
            </View>
          </View>
        </Card.Content>
        
        <Card.Actions style={styles.cardActions}>
          <Button 
            mode="contained" 
            onPress={() => navigateToEventDetails(item)}
            style={{ backgroundColor: eventColor }}
          >
            Voir détails
          </Button>
        </Card.Actions>
      </Card>
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
      
      {loading ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={colors.primary} />
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
              <Text style={styles.emptyText}>Aucun événement à venir</Text>
            </View>
          }
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
  eventCard: {
    marginBottom: 12,
    elevation: 2,
  },
  eventHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  eventTypeIndicator: {
    width: 4,
    height: 20,
    borderRadius: 2,
    marginRight: 8,
  },
  eventTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    flex: 1,
  },
  registeredChip: {
    backgroundColor: '#e6f7ef',
    height: 24,
  },
  eventDate: {
    fontSize: 14,
    color: '#666',
    marginBottom: 8,
  },
  eventDetails: {
    marginTop: 8,
  },
  eventDetailRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 4,
  },
  eventDetailText: {
    fontSize: 14,
    color: '#666',
    marginLeft: 6,
  },
  cardActions: {
    justifyContent: 'flex-end',
    paddingHorizontal: 16,
    paddingBottom: 8,
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
