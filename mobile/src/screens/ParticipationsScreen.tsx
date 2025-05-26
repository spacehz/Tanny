import React, { useState, useCallback, useMemo } from 'react';
import { View, StyleSheet, FlatList, RefreshControl, Alert } from 'react-native';
import { Text, Card, Button, ActivityIndicator, Divider, Chip } from 'react-native-paper';
import { Ionicons } from '@expo/vector-icons';

import { useAuth } from '../context/AuthContext';
import { useAssignments } from '../hooks/useAssignments';
import { colors } from '../constants/theme';

interface Assignment {
  _id: string;
  event: {
    _id: string;
    name: string;
    type: string;
    location: string;
    date: string;
  };
  merchant: {
    _id: string;
    businessName: string;
    address: string | { street: string; city: string; postalCode: string };
  };
  items: Array<{
    name: string;
    quantity: number;
    unit: string;
  }>;
  status: string;
  startTime: string | null;
  endTime: string | null;
  duration: number;
  createdAt: string;
}

const ParticipationsScreen = () => {
  const [refreshing, setRefreshing] = useState(false);
  const [actionLoading, setActionLoading] = useState<string | null>(null);
  
  const { user } = useAuth();
  
  // Utiliser le hook personnalisé pour les affectations
  const { 
    assignments, 
    isLoading, 
    isError, 
    refetch, 
    startAssignment: startAssignmentMutation,
    endAssignment: endAssignmentMutation,
    updateAssignmentStatus: updateStatusMutation,
    isStarting,
    isEnding,
    isUpdating,
    stats
  } = useAssignments(user?._id || '');

  // Fonction pour rafraîchir les affectations
  const onRefresh = useCallback(() => {
    setRefreshing(true);
    refetch().finally(() => setRefreshing(false));
  }, [refetch]);

  // Fonction pour formater la date
  const formatDate = (dateString: string | undefined) => {
    if (!dateString) return 'Date non spécifiée';
    
    const options: Intl.DateTimeFormatOptions = { 
      weekday: 'long', 
      year: 'numeric', 
      month: 'long', 
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    };
    
    try {
      return new Date(dateString).toLocaleDateString('fr-FR', options);
    } catch (error) {
      return 'Date invalide';
    }
  };

  // Fonction pour formater la liste des produits
  const formatProductsList = (items: Assignment['items'] | undefined) => {
    if (!items || items.length === 0) return 'Aucun produit';
    
    return items.map(item => `${item.name} (${item.quantity} ${item.unit})`).join(', ');
  };

  // Fonction pour démarrer une affectation
  const handleStartAssignment = async (id: string) => {
    try {
      setActionLoading(id);
      await startAssignmentMutation(id);
      Alert.alert('Succès', 'Affectation démarrée !');
    } catch (error) {
      console.error('Erreur lors du démarrage de l\'affectation:', error);
      Alert.alert('Erreur', 'Une erreur est survenue lors du démarrage de l\'affectation');
    } finally {
      setActionLoading(null);
    }
  };

  // Fonction pour terminer une affectation
  const handleEndAssignment = async (id: string) => {
    try {
      setActionLoading(id);
      await endAssignmentMutation(id);
      Alert.alert('Succès', 'Affectation terminée !');
    } catch (error) {
      console.error('Erreur lors de la fin de l\'affectation:', error);
      Alert.alert('Erreur', 'Une erreur est survenue lors de la fin de l\'affectation');
    } finally {
      setActionLoading(null);
    }
  };

  // Fonction pour marquer une affectation comme terminée
  const markAssignmentAsCompleted = async (id: string) => {
    try {
      setActionLoading(id);
      await updateStatusMutation({ assignmentId: id, status: 'completed' });
      Alert.alert('Succès', 'Affectation marquée comme terminée !');
    } catch (error) {
      console.error('Erreur lors de la mise à jour du statut:', error);
      Alert.alert('Erreur', 'Une erreur est survenue lors de la mise à jour du statut');
    } finally {
      setActionLoading(null);
    }
  };

  // Fonction pour obtenir la couleur du statut
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed':
        return '#10b981'; // vert
      case 'in_progress':
        return '#3b82f6'; // bleu
      default:
        return '#f59e0b'; // orange
    }
  };

  // Fonction pour obtenir le libellé du statut
  const getStatusLabel = (status: string) => {
    switch (status) {
      case 'completed':
        return 'Terminé';
      case 'in_progress':
        return 'En cours';
      default:
        return 'En attente';
    }
  };

  // Rendu d'une affectation dans la liste
  const renderAssignmentItem = ({ item }: { item: Assignment }) => {
    const statusColor = getStatusColor(item.status);
    const statusLabel = getStatusLabel(item.status);
    
    // Formater l'adresse du commerçant
    const merchantAddress = typeof item.merchant?.address === 'string' 
      ? item.merchant.address 
      : item.merchant?.address?.street 
        ? `${item.merchant.address.street}, ${item.merchant.address.city || ''} ${item.merchant.address.postalCode || ''}` 
        : 'Adresse non spécifiée';

    return (
      <Card style={styles.assignmentCard}>
        <Card.Content>
          <View style={styles.assignmentHeader}>
            <Text style={styles.assignmentTitle}>
              {item.event?.name || `Événement à ${item.event?.location || 'lieu inconnu'}`}
            </Text>
            <Chip 
              style={[styles.statusChip, { backgroundColor: `${statusColor}20` }]}
              textStyle={{ color: statusColor }}
            >
              {statusLabel}
            </Chip>
          </View>
          
          <Divider style={styles.divider} />
          
          <View style={styles.infoSection}>
            <View style={styles.infoRow}>
              <Ionicons name="business-outline" size={16} color="#666" />
              <Text style={styles.infoText}>{item.merchant?.businessName || 'Commerçant non spécifié'}</Text>
            </View>
            
            <View style={styles.infoRow}>
              <Ionicons name="location-outline" size={16} color="#666" />
              <Text style={styles.infoText}>{merchantAddress}</Text>
            </View>
            
            <View style={styles.infoRow}>
              <Ionicons name="calendar-outline" size={16} color="#666" />
              <Text style={styles.infoText}>
                {item.event?.date ? formatDate(item.event.date) : 'Date non spécifiée'}
              </Text>
            </View>
            
            {item.startTime && (
              <View style={styles.infoRow}>
                <Ionicons name="time-outline" size={16} color="#666" />
                <Text style={styles.infoText}>Début: {formatDate(item.startTime)}</Text>
              </View>
            )}
            
            {item.endTime && (
              <View style={styles.infoRow}>
                <Ionicons name="time-outline" size={16} color="#666" />
                <Text style={styles.infoText}>Fin: {formatDate(item.endTime)}</Text>
              </View>
            )}
            
            {item.duration > 0 && (
              <View style={styles.infoRow}>
                <Ionicons name="hourglass-outline" size={16} color="#666" />
                <Text style={styles.infoText}>
                  Durée: {Math.floor(item.duration / 60)}h{item.duration % 60 > 0 ? ` ${item.duration % 60}min` : ''}
                </Text>
              </View>
            )}
          </View>
          
          <Divider style={styles.divider} />
          
          <Text style={styles.sectionTitle}>Produits</Text>
          <Text style={styles.productsText}>{formatProductsList(item.items)}</Text>
        </Card.Content>
        
        <Card.Actions style={styles.cardActions}>
          {item.status === 'pending' ? (
            <Button 
              mode="contained" 
              onPress={() => handleStartAssignment(item._id)}
              style={[styles.actionButton, { backgroundColor: '#3b82f6' }]}
              disabled={actionLoading === item._id}
            >
              {actionLoading === item._id ? (
                <ActivityIndicator color="#fff" size="small" />
              ) : (
                'Débuter'
              )}
            </Button>
          ) : item.status === 'in_progress' ? (
            <Button 
              mode="contained" 
              onPress={() => handleEndAssignment(item._id)}
              style={[styles.actionButton, { backgroundColor: '#10b981' }]}
              disabled={actionLoading === item._id}
            >
              {actionLoading === item._id ? (
                <ActivityIndicator color="#fff" size="small" />
              ) : (
                'Terminer'
              )}
            </Button>
          ) : (
            <Button 
              mode="outlined" 
              disabled={true}
              style={styles.actionButton}
            >
              Terminé
            </Button>
          )}
        </Card.Actions>
      </Card>
    );
  };

  // Utiliser les statistiques calculées par le hook
  const { total: totalAssignments, completed: completedAssignments, inProgress: inProgressAssignments, pending: pendingAssignments } = stats;

  return (
    <View style={styles.container}>
      <View style={styles.statsContainer}>
        <View style={styles.statCard}>
          <Text style={styles.statValue}>{totalAssignments}</Text>
          <Text style={styles.statLabel}>Total</Text>
        </View>
        
        <View style={styles.statCard}>
          <Text style={styles.statValue}>{pendingAssignments}</Text>
          <Text style={styles.statLabel}>À venir</Text>
        </View>
        
        <View style={styles.statCard}>
          <Text style={styles.statValue}>{completedAssignments}</Text>
          <Text style={styles.statLabel}>Terminées</Text>
        </View>
      </View>
      
      <Text style={styles.sectionTitle}>Mes affectations</Text>
      
      {isLoading ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={colors.primary} />
        </View>
      ) : isError ? (
        <View style={styles.emptyContainer}>
          <Text style={styles.emptyText}>Erreur lors du chargement des affectations</Text>
          <Button mode="contained" onPress={onRefresh} style={{ marginTop: 10 }}>
            Réessayer
          </Button>
        </View>
      ) : (
        <FlatList
          data={assignments}
          keyExtractor={(item) => item._id}
          renderItem={renderAssignmentItem}
          contentContainerStyle={styles.assignmentsList}
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
          }
          ListEmptyComponent={
            <View style={styles.emptyContainer}>
              <Text style={styles.emptyText}>Aucune affectation trouvée</Text>
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
  statsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    padding: 16,
    backgroundColor: '#fff',
    marginBottom: 8,
  },
  statCard: {
    flex: 1,
    alignItems: 'center',
    padding: 12,
  },
  statValue: {
    fontSize: 24,
    fontWeight: 'bold',
    color: colors.primary,
  },
  statLabel: {
    fontSize: 14,
    color: '#666',
    marginTop: 4,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginVertical: 12,
    marginHorizontal: 16,
    color: '#333',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  assignmentsList: {
    paddingHorizontal: 16,
    paddingBottom: 16,
  },
  assignmentCard: {
    marginBottom: 12,
    elevation: 2,
  },
  assignmentHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  assignmentTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    flex: 1,
    marginRight: 8,
  },
  statusChip: {
    height: 24,
  },
  divider: {
    marginVertical: 8,
  },
  infoSection: {
    marginVertical: 8,
  },
  infoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 6,
  },
  infoText: {
    fontSize: 14,
    color: '#666',
    marginLeft: 8,
    flex: 1,
  },
  productsText: {
    fontSize: 14,
    color: '#666',
    lineHeight: 20,
  },
  cardActions: {
    justifyContent: 'flex-end',
    paddingHorizontal: 16,
    paddingBottom: 8,
  },
  actionButton: {
    paddingHorizontal: 16,
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

export default ParticipationsScreen;
