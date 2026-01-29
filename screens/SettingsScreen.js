import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Alert,
  SafeAreaView,
  ScrollView,
  Platform,
} from 'react-native';
import Icon from 'react-native-vector-icons/MaterialIcons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import Toast from 'react-native-toast-message';

export default function SettingsScreen({ navigation }) {
  const [userDetails, setUserDetails] = useState(null);
  const [isLoggedIn, setIsLoggedIn] = useState(true);

  useEffect(() => {
    fetchUserDetails();
  }, []);

  const fetchUserDetails = async () => {
    try {
      const token = await AsyncStorage.getItem('authToken');
      if (!token) {
        setIsLoggedIn(false);
        setUserDetails(null);
        return;
      }

      const response = await fetch(
        `https://service-booking-backend-eb9i.onrender.com/api/auth/user-details`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (response.status === 401) {
        await AsyncStorage.removeItem('authToken');
        setIsLoggedIn(false);
        setUserDetails(null);
        return;
      }

      if (response.ok) {
        const data = await response.json();
        if (data.success && data.user) {
          setIsLoggedIn(true);
          setUserDetails(data.user);
        }
      }
    } catch (error) {
      console.log('Error fetching user details:', error.message);
    }
  };

  const handleLogout = async () => {
    Alert.alert(
      'Logout',
      'Are you sure you want to logout?',
      [
        {
          text: 'Cancel',
          style: 'cancel',
        },
        {
          text: 'Logout',
          style: 'destructive',
          onPress: async () => {
            try {
              await AsyncStorage.removeItem('authToken');
              setIsLoggedIn(false);
              setUserDetails(null);
              
              Toast.show({
                type: 'success',
                text1: 'Logged Out',
                text2: 'You have been logged out successfully',
              });

              setTimeout(() => {
                navigation.navigate('Home', { role: 'Client' });
              }, 1000);
            } catch (error) {
              console.error('Error during logout:', error);
              Toast.show({
                type: 'error',
                text1: 'Logout Failed',
                text2: 'Something went wrong. Please try again.',
              });
            }
          },
        },
      ]
    );
  };

  const handleDeleteAccount = () => {
    Alert.alert(
      'Delete Account',
      'Are you sure you want to delete your account? This action cannot be undone.',
      [
        {
          text: 'Cancel',
          style: 'cancel',
        },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            try {
              const token = await AsyncStorage.getItem('authToken');
              const response = await fetch(
                `https://service-booking-backend-eb9i.onrender.com/api/auth/delete-account`,
                {
                  method: 'DELETE',
                  headers: {
                    Authorization: `Bearer ${token}`,
                  },
                }
              );

              const result = await response.json();
              if (response.ok) {
                await AsyncStorage.removeItem('authToken');
                setIsLoggedIn(false);
                setUserDetails(null);
                
                Toast.show({
                  type: 'success',
                  text1: 'Account Deleted',
                  text2: 'Your account has been deleted successfully.',
                });

                setTimeout(() => {
                  navigation.navigate('Home', { role: 'Client' });
                }, 1500);
              } else {
                Toast.show({
                  type: 'error',
                  text1: 'Delete Failed',
                  text2: result.message || 'Something went wrong.',
                });
              }
            } catch (error) {
              console.error('Error deleting account:', error);
              Toast.show({
                type: 'error',
                text1: 'Error',
                text2: 'Something went wrong. Please try again.',
              });
            }
          },
        },
      ]
    );
  };

  const settingsSections = [
    {
      title: 'Account',
      items: [
        {
          icon: 'person',
          title: 'My Account',
          description: 'Manage your profile and preferences',
          onPress: () => {
            if (isLoggedIn && userDetails) {
              navigation.navigate('UserAccount', {
                userId: userDetails?.id,
                role: userDetails?.role,
              });
            }
          },
          type: 'navigation',
          iconColor: '#1a237e',
          iconBg: '#e8eaf6',
        },
        {
          icon: 'notifications',
          title: 'Notifications',
          description: 'Manage notification preferences',
          onPress: () => console.log('Notifications'),
          type: 'navigation',
          iconColor: '#1976d2',
          iconBg: '#e3f2fd',
        },
      ],
    },
    {
      title: 'Support',
      items: [
        {
          icon: 'help',
          title: 'Help & Support',
          description: 'Get help and contact support',
          onPress: () => navigation.navigate('Support'),
          type: 'navigation',
          iconColor: '#388e3c',
          iconBg: '#e8f5e9',
        },
        {
          icon: 'info',
          title: 'About',
          description: 'App version and information',
          onPress: () => console.log('About'),
          type: 'navigation',
          iconColor: '#f57c00',
          iconBg: '#fff3e0',
        },
      ],
    },
    {
      title: 'Danger Zone',
      items: [
        {
          icon: 'delete-forever',
          title: 'Delete Account',
          description: 'Permanently delete your account',
          onPress: handleDeleteAccount,
          type: 'danger',
          iconColor: '#d32f2f',
          iconBg: '#ffebee',
        },
        {
          icon: 'logout',
          title: 'Logout',
          description: 'Sign out of your account',
          onPress: handleLogout,
          type: 'danger',
          iconColor: '#d32f2f',
          iconBg: '#ffebee',
        },
      ],
    },
  ];

  return (
    <SafeAreaView style={styles.safeArea}>
      <Toast />
      <View style={styles.container}>
        {/* Header Section */}
        <View style={styles.header}>
          <TouchableOpacity
            style={styles.backButton}
            onPress={() => navigation.goBack()}
            activeOpacity={0.7}
          >
            <View style={styles.backButtonInner}>
              <Icon name="arrow-back" size={24} color="#1a237e" />
            </View>
          </TouchableOpacity>
          <View style={styles.headerContent}>
            <View style={styles.headerIconContainer}>
              <View style={styles.headerIconInner}>
                <Icon name="settings" size={32} color="#1a237e" />
              </View>
            </View>
            <Text style={styles.headerTitle}>Settings</Text>
            <Text style={styles.headerSubtitle}>
              Manage your account and preferences
            </Text>
          </View>
        </View>

        <ScrollView
          style={styles.scrollView}
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
        >
          {/* User Info Card (if logged in) */}
          {isLoggedIn && userDetails && (
            <View style={styles.userCard}>
              <View style={styles.userAvatarContainer}>
                <View style={styles.userAvatar}>
                  <Icon name="person" size={32} color="#1a237e" />
                </View>
                <View style={styles.userStatusBadge}>
                  <Icon name="check-circle" size={16} color="#4caf50" />
                </View>
              </View>
              <View style={styles.userInfo}>
                <Text style={styles.userName}>{userDetails.name || 'User'}</Text>
                <Text style={styles.userEmail}>{userDetails.email}</Text>
                <View style={styles.roleBadge}>
                  <Icon name="verified-user" size={12} color="#1a237e" />
                  <Text style={styles.roleText}>{userDetails.role || 'User'}</Text>
                </View>
              </View>
            </View>
          )}

          {/* Settings Sections */}
          {settingsSections.map((section, sectionIndex) => (
            <View key={sectionIndex} style={styles.section}>
              <Text style={styles.sectionTitle}>{section.title}</Text>
              <View style={styles.sectionContent}>
                {section.items.map((item, itemIndex) => (
                  <TouchableOpacity
                    key={itemIndex}
                    style={[
                      styles.settingCard,
                      itemIndex === section.items.length - 1 && styles.lastCard,
                      item.type === 'danger' && styles.dangerCard,
                    ]}
                    onPress={item.onPress}
                    activeOpacity={0.7}
                  >
                    <View style={styles.settingCardContent}>
                      <View
                        style={[
                          styles.iconContainer,
                          { backgroundColor: item.iconBg },
                        ]}
                      >
                        <Icon name={item.icon} size={24} color={item.iconColor} />
                      </View>
                      <View style={styles.settingInfo}>
                        <Text
                          style={[
                            styles.settingTitle,
                            item.type === 'danger' && styles.dangerText,
                          ]}
                        >
                          {item.title}
                        </Text>
                        <Text style={styles.settingDescription}>
                          {item.description}
                        </Text>
                      </View>
                      {item.type === 'navigation' && (
                        <View style={styles.arrowContainer}>
                          <Icon name="arrow-forward-ios" size={16} color="#999" />
                        </View>
                      )}
                    </View>
                  </TouchableOpacity>
                ))}
              </View>
            </View>
          ))}

          {/* App Info Footer */}
          <View style={styles.appInfoFooter}>
            <Text style={styles.appVersion}>Version 1.0.0</Text>
            <Text style={styles.appCopyright}>
              © 2026 Veldt Investment cc. All rights reserved.
            </Text>
          </View>
        </ScrollView>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#f8f9fc',
  },
  container: {
    flex: 1,
  },
  header: {
    backgroundColor: '#fff',
    paddingTop: Platform.OS === 'ios' ? 0 : 20,
    paddingBottom: 24,
    paddingHorizontal: 20,
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.08,
        shadowRadius: 8,
      },
      android: {
        elevation: 4,
      },
    }),
  },
  backButton: {
    marginBottom: 16,
  },
  backButtonInner: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(26, 35, 126, 0.08)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerContent: {
    alignItems: 'center',
  },
  headerIconContainer: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: '#fff',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 16,
    borderWidth: 2,
    borderColor: '#f0f0f0',
  },
  headerIconInner: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: 'rgba(26, 35, 126, 0.08)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: '800',
    color: '#1a237e',
    marginBottom: 6,
    textAlign: 'center',
    letterSpacing: -0.5,
  },
  headerSubtitle: {
    fontSize: 14,
    color: '#666',
    textAlign: 'center',
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingBottom: 24,
  },
  userCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    marginHorizontal: 20,
    marginTop: 20,
    marginBottom: 8,
    padding: 18,
    borderRadius: 16,
    borderWidth: 2,
    borderColor: '#1a237e',
    ...Platform.select({
      ios: {
        shadowColor: '#1a237e',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.15,
        shadowRadius: 8,
      },
      android: {
        elevation: 4,
      },
    }),
  },
  userAvatarContainer: {
    position: 'relative',
    marginRight: 14,
  },
  userAvatar: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: 'rgba(26, 35, 126, 0.1)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  userStatusBadge: {
    position: 'absolute',
    bottom: 0,
    right: 0,
    width: 20,
    height: 20,
    borderRadius: 10,
    backgroundColor: '#fff',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderColor: '#fff',
  },
  userInfo: {
    flex: 1,
  },
  userName: {
    fontSize: 18,
    fontWeight: '700',
    color: '#1a237e',
    marginBottom: 4,
  },
  userEmail: {
    fontSize: 13,
    color: '#666',
    marginBottom: 8,
  },
  roleBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    alignSelf: 'flex-start',
    backgroundColor: 'rgba(26, 35, 126, 0.08)',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
    gap: 4,
  },
  roleText: {
    fontSize: 11,
    fontWeight: '600',
    color: '#1a237e',
    textTransform: 'uppercase',
  },
  section: {
    marginTop: 20,
    paddingHorizontal: 20,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#1a237e',
    marginBottom: 12,
    letterSpacing: -0.3,
  },
  sectionContent: {
    gap: 8,
  },
  settingCard: {
    backgroundColor: '#fff',
    borderRadius: 14,
    borderWidth: 1,
    borderColor: '#f0f0f0',
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.05,
        shadowRadius: 8,
      },
      android: {
        elevation: 2,
      },
    }),
  },
  dangerCard: {
    borderColor: '#ffebee',
  },
  lastCard: {
    marginBottom: 0,
  },
  settingCardContent: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
  },
  iconContainer: {
    width: 48,
    height: 48,
    borderRadius: 24,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 14,
  },
  settingInfo: {
    flex: 1,
  },
  settingTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1a237e',
    marginBottom: 3,
  },
  dangerText: {
    color: '#d32f2f',
  },
  settingDescription: {
    fontSize: 13,
    color: '#666',
    lineHeight: 18,
  },
  arrowContainer: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: 'rgba(26, 35, 126, 0.05)',
    alignItems: 'center',
    justifyContent: 'center',
    marginLeft: 8,
  },
  appInfoFooter: {
    alignItems: 'center',
    marginTop: 32,
    paddingHorizontal: 20,
  },
  appVersion: {
    fontSize: 13,
    color: '#999',
    fontWeight: '600',
    marginBottom: 4,
  },
  appCopyright: {
    fontSize: 12,
    color: '#999',
    textAlign: 'center',
  },
});

