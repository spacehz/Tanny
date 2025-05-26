import React, { memo } from 'react';
import { View, StyleSheet, TouchableOpacity } from 'react-native';
import { Text, Card, Button, Chip } from 'react-native-paper';
import { Ionicons } from '@expo/vector-icons';
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

interface EventCardProps {
  event: Event;
  isUserRegistered: boolean;
  onPress: () => void;
}

const EventCard = ({ event, isUserRegistered, onPress }: EventCardProps) => {
  // Déterminer la couleur en fonction du type d'événement
  const getEventColor = (type: string) => {
    if (!type) return colors.primary;
    
    const lowerType = type.toLowerCase();
    if (lowerType.includes('marché') || lowerType.includes('marche')) {
      return colors.secondary;
    }
    
    return colors.primary;
  };
  
  // Formater la date
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
  
  const eventColor = getEventColor(event.type);
  
  // Calculer le nombre de places disponibles
  // Utiliser expectedVolunteers (minuscule) en priorité, puis ExpectedVolunteers (majuscule) pour la rétrocompatibilité
  const totalVolunteersNeeded = Number(event.expectedVolunteers) || Number(event.ExpectedVolunteers) || 5;
  const registeredVolunteers = Array.isArray(event.volunteers) ? event.volunteers.length : 0;
  const availableSpots = Math.max(0, totalVolunteersNeeded - registeredVolunteers);
  const isFullyBooked = availableSpots <= 0;
  
  // Log pour déboguer
  if (event.title === 'Collecte pain') {
    console.log('EventCard - Collecte pain:', {
      expectedVolunteers: event.expectedVolunteers,
      ExpectedVolunteers: event.ExpectedVolunteers,
      totalVolunteersNeeded,
      registeredVolunteers,
      availableSpots
    });
  }

  return (
    <Card style={styles.eventCard} onPress={onPress}>
      <Card.Content>
        <View style={styles.eventHeader}>
          <View style={[styles.eventTypeIndicator, { backgroundColor: eventColor }]} />
          <Text style={styles.eventTitle}>{event.title}</Text>
          {isUserRegistered && (
            <Chip style={styles.registeredChip} textStyle={{ color: colors.primary }}>
              Inscrit
            </Chip>
          )}
        </View>
        
        <Text style={styles.eventDate}>{formatDate(event.start)}</Text>
        
        <View style={styles.eventDetails}>
          <View style={styles.eventDetailRow}>
            <Ionicons name="location-outline" size={16} color="#666" />
            <Text style={styles.eventDetailText}>{event.location || 'Lieu non précisé'}</Text>
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
          onPress={onPress}
          style={{ backgroundColor: eventColor }}
        >
          Voir détails
        </Button>
      </Card.Actions>
    </Card>
  );
};

const styles = StyleSheet.create({
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
});

// Utiliser memo pour éviter les rendus inutiles
export default memo(EventCard);
