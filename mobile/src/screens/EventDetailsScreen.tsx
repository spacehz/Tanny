import React, { useState } from 'react';
import { View, StyleSheet, ScrollView, Alert, ActivityIndicator } from 'react-native';
import { Text, Card, Button, Divider, Chip } from 'react-native-paper';
import { Ionicons } from '@expo/vector-icons';
import { useRoute, useNavigation, RouteProp } from '@react-navigation/native';

import { useAuth } from '../context/AuthContext';
import { registerForEvent, unregisterFromEvent } from '../services/eventService';
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

type RouteParams = {
  event: Event;
};

const EventDetailsScreen = () => {
  const [loading, setLoading] = useState(false);
  const route = useRoute<RouteProp<Record<string, RouteParams>, string>>();
  const navigation = useNavigation();
  const { user } = useAuth();
  
  const event = route.params?.event;
  
  if (!event) {
    return (
      <View style={styles.container}>
        <Text>Événement non trouvé</Text>
      </View>
    );
  }
  
  // Calculer le nombre de places disponibles
  const totalVolunteersNeeded = event.ExpectedVolunteers || 5;
  const registeredVolunteers = event.volunteers?.length || 0;
  const availableSpots = Math.max(0, totalVolunteersNeeded - registeredVolunteers);
  const isFullyBooked = availableSpots <= 0;
  
  // Vérifier si l'utilisateur est inscrit
  const isUserRegistered = event.volunteers && event.volunteers.includes(user?._id || '');
  
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
  
  // Fonction pour déterminer la couleur en fonction du type d'événement
  const getEventColor = (type: string) => {
    if (!type) return colors.primary;
    
    const lowerType = type.toLowerCase();
    if (lowerType.includes('marché') || lowerType.includes('marche')) {
      return colors.secondary;
    }
    
    return colors.primary;
  };
  
  const eventColor = getEventColor(event.type);
  
  // Fonction pour s'inscrire à un événement
  const handleRegister = async () => {
    try {
      setLoading(true);
      await registerForEvent(event._id);
      Alert.alert('Succès', 'Vous êtes maintenant inscrit à cet événement');
      navigation.goBack();
    } catch (error) {
      console.error('Erreur lors de l\'inscription:', error);
      Alert.alert('Erreur', 'Une erreur est survenue lors de l\'inscription');
    } finally {
      setLoading(false);
    }
  };
  
  // Fonction pour se désinscrire d'un événement
  const handleUnregister = async () => {
    try {
      setLoading(true);
      await unregisterFromEvent(event._id);
      Alert.alert('Succès', 'Vous êtes maintenant désinscrit de cet événement');
      navigation.goBack();
    } catch (error) {
      console.error('Erreur lors de la désinscription:', error);
      Alert.alert('Erreur', 'Une erreur est survenue lors de la désinscription');
    } finally {
      setLoading(false);
    }
  };

  return (
    <ScrollView style={styles.container}>
      <Card style={styles.card}>
        <Card.Content>
          <View style={styles.headerContainer}>
            <View style={[styles.typeIndicator, { backgroundColor: eventColor }]} />
            <Text style={styles.title}>{event.title}</Text>
          </View>
          
          {isUserRegistered && (
            <Chip style={styles.registeredChip} textStyle={{ color: colors.primary }}>
              Vous êtes inscrit
            </Chip>
          )}
          
          <Divider style={styles.divider} />
          
          <View style={styles.infoSection}>
            <View style={styles.infoRow}>
              <Ionicons name="calendar-outline" size={20} color="#666" />
              <Text style={styles.infoText}>{formatDate(event.start)}</Text>
            </View>
            
            <View style={styles.infoRow}>
              <Ionicons name="location-outline" size={20} color="#666" />
              <Text style={styles.infoText}>{event.location || 'Lieu non précisé'}</Text>
            </View>
            
            <View style={styles.infoRow}>
              <Ionicons name="people-outline" size={20} color="#666" />
              <Text style={styles.infoText}>
                {isFullyBooked ? (
                  <Text style={{ color: 'red' }}>Complet</Text>
                ) : (
                  `${availableSpots} places disponibles sur ${totalVolunteersNeeded}`
                )}
              </Text>
            </View>
            
            <View style={styles.infoRow}>
              <Ionicons name="information-circle-outline" size={20} color="#666" />
              <Text style={styles.infoText}>{event.type || 'Type non précisé'}</Text>
            </View>
          </View>
          
          <Divider style={styles.divider} />
          
          <Text style={styles.sectionTitle}>Description</Text>
          <Text style={styles.description}>{event.description || 'Aucune description disponible'}</Text>
          
          <View style={styles.progressContainer}>
            <Text style={styles.progressText}>
              {registeredVolunteers} / {totalVolunteersNeeded} bénévoles inscrits
            </Text>
            <View style={styles.progressBar}>
              <View 
                style={[
                  styles.progressFill, 
                  { 
                    width: `${(registeredVolunteers / totalVolunteersNeeded) * 100}%`,
                    backgroundColor: isFullyBooked ? colors.error : eventColor
                  }
                ]} 
              />
            </View>
          </View>
        </Card.Content>
        
        <Card.Actions style={styles.cardActions}>
          {isUserRegistered ? (
            <Button 
              mode="contained" 
              onPress={handleUnregister}
              style={[styles.button, { backgroundColor: colors.error }]}
              disabled={loading}
            >
              {loading ? (
                <ActivityIndicator color="#fff" size="small" />
              ) : (
                'Se désinscrire'
              )}
            </Button>
          ) : (
            <Button 
              mode="contained" 
              onPress={handleRegister}
              style={[styles.button, { backgroundColor: eventColor }]}
              disabled={loading || isFullyBooked}
            >
              {loading ? (
                <ActivityIndicator color="#fff" size="small" />
              ) : isFullyBooked ? (
                'Complet'
              ) : (
                'S\'inscrire'
              )}
            </Button>
          )}
        </Card.Actions>
      </Card>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  card: {
    margin: 16,
    elevation: 4,
  },
  headerContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  typeIndicator: {
    width: 4,
    height: 24,
    borderRadius: 2,
    marginRight: 12,
  },
  title: {
    fontSize: 20,
    fontWeight: 'bold',
    flex: 1,
  },
  registeredChip: {
    backgroundColor: '#e6f7ef',
    alignSelf: 'flex-start',
    marginBottom: 12,
  },
  divider: {
    marginVertical: 16,
  },
  infoSection: {
    marginBottom: 16,
  },
  infoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  infoText: {
    fontSize: 16,
    marginLeft: 12,
    color: '#333',
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 8,
    color: '#333',
  },
  description: {
    fontSize: 16,
    lineHeight: 24,
    color: '#444',
  },
  progressContainer: {
    marginTop: 20,
  },
  progressText: {
    fontSize: 14,
    marginBottom: 6,
    color: '#666',
  },
  progressBar: {
    height: 8,
    backgroundColor: '#e0e0e0',
    borderRadius: 4,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    borderRadius: 4,
  },
  cardActions: {
    justifyContent: 'flex-end',
    paddingHorizontal: 16,
    paddingBottom: 16,
  },
  button: {
    paddingHorizontal: 16,
  },
});

export default EventDetailsScreen;
