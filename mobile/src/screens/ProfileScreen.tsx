import React from 'react';
import { View, StyleSheet, ScrollView, Alert } from 'react-native';
import { Text, Card, Button, Avatar, Divider, List } from 'react-native-paper';
import { Ionicons } from '@expo/vector-icons';

import { useAuth } from '../context/AuthContext';
import { colors } from '../constants/theme';

const ProfileScreen = () => {
  const { user, logout } = useAuth();

  const handleLogout = async () => {
    try {
      await logout();
    } catch (error) {
      console.error('Erreur lors de la déconnexion:', error);
      Alert.alert('Erreur', 'Une erreur est survenue lors de la déconnexion');
    }
  };

  // Obtenir les initiales de l'utilisateur pour l'avatar
  const getInitials = () => {
    if (!user?.name) return '?';
    
    const nameParts = user.name.split(' ');
    if (nameParts.length === 1) {
      return nameParts[0].charAt(0).toUpperCase();
    }
    
    return (nameParts[0].charAt(0) + nameParts[nameParts.length - 1].charAt(0)).toUpperCase();
  };

  return (
    <ScrollView style={styles.container}>
      <Card style={styles.profileCard}>
        <Card.Content style={styles.profileContent}>
          <Avatar.Text 
            size={80} 
            label={getInitials()} 
            style={styles.avatar}
            labelStyle={styles.avatarLabel}
          />
          
          <View style={styles.profileInfo}>
            <Text style={styles.name}>{user?.name || 'Utilisateur'}</Text>
            <Text style={styles.email}>{user?.email || 'Email non disponible'}</Text>
            <Text style={styles.role}>
              {user?.role === 'volunteer' || user?.role === 'bénévole' 
                ? 'Bénévole' 
                : user?.role === 'admin' 
                  ? 'Administrateur' 
                  : 'Utilisateur'}
            </Text>
          </View>
        </Card.Content>
      </Card>
      
      <Card style={styles.card}>
        <Card.Content>
          <Text style={styles.sectionTitle}>Informations</Text>
          
          <List.Item
            title="Nom complet"
            description={user?.name || 'Non renseigné'}
            left={props => <List.Icon {...props} icon="account" />}
          />
          
          <Divider />
          
          <List.Item
            title="Email"
            description={user?.email || 'Non renseigné'}
            left={props => <List.Icon {...props} icon="email" />}
          />
          
          <Divider />
          
          <List.Item
            title="Rôle"
            description={
              user?.role === 'volunteer' || user?.role === 'bénévole' 
                ? 'Bénévole' 
                : user?.role === 'admin' 
                  ? 'Administrateur' 
                  : 'Utilisateur'
            }
            left={props => <List.Icon {...props} icon="shield-account" />}
          />
        </Card.Content>
      </Card>
      
      <Card style={styles.card}>
        <Card.Content>
          <Text style={styles.sectionTitle}>Application</Text>
          
          <List.Item
            title="Version de l'application"
            description="1.0.0"
            left={props => <List.Icon {...props} icon="information" />}
          />
          
          <Divider />
          
          <List.Item
            title="À propos"
            description="TANY - Application mobile pour les bénévoles"
            left={props => <List.Icon {...props} icon="information-outline" />}
          />
        </Card.Content>
      </Card>
      
      <View style={styles.buttonContainer}>
        <Button 
          mode="contained" 
          onPress={handleLogout}
          style={styles.logoutButton}
          icon="logout"
        >
          Se déconnecter
        </Button>
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  profileCard: {
    margin: 16,
    elevation: 4,
  },
  profileContent: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 8,
  },
  avatar: {
    backgroundColor: colors.primary,
  },
  avatarLabel: {
    fontSize: 32,
  },
  profileInfo: {
    marginLeft: 20,
  },
  name: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#333',
  },
  email: {
    fontSize: 14,
    color: '#666',
    marginTop: 4,
  },
  role: {
    fontSize: 14,
    color: colors.primary,
    fontWeight: '500',
    marginTop: 4,
  },
  card: {
    marginHorizontal: 16,
    marginBottom: 16,
    elevation: 2,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 16,
    color: '#333',
  },
  buttonContainer: {
    margin: 16,
    marginTop: 8,
  },
  logoutButton: {
    backgroundColor: colors.error,
  },
});

export default ProfileScreen;
