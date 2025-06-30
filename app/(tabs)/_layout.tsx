import { Tabs } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { View, TouchableOpacity, StyleSheet, Platform, Text } from 'react-native';
import { useRouter } from 'expo-router';
import Svg, { Path } from 'react-native-svg';

export default function TabLayout() {
  const router = useRouter();

  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarShowLabel: false,
        tabBarStyle: {
          position: 'absolute',
          bottom: 0,
          left: 0,
          right: 0,
          height: 80,
          paddingTop: 10,
          paddingBottom: Platform.OS === 'ios' ? 25 : 15,
          backgroundColor: 'transparent',
          borderTopWidth: 0,
          elevation: 0,
          shadowOpacity: 0,
        },
        tabBarBackground: () => (
          <View style={styles.tabBarBackground}>
            <Svg
      width="100%"
      height="100"
      viewBox="0 0 375 80"
      style={StyleSheet.absoluteFillObject}
    >
      <Path
        d="
          M0 0
          H135
          C150 0, 150 40, 187.5 40
          C225 40, 225 0, 240 0
          H375
          V90
          H0
          Z
        "
        fill="#FFFFFF"
      />
    </Svg>
          </View>
        ),
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          tabBarIcon: ({ focused }) => (
            <Ionicons
              name="home"
              size={26}
              color={focused ? "#FF7B00" : "#999"}
            />
          ),
        }}
      />

      <Tabs.Screen
        name="new-lead"
        options={{
          tabBarButton: () => (
            <View style={styles.floatingButtonContainer}>
              <TouchableOpacity
                onPress={() => router.push('/new-lead')}
                style={styles.floatingButton}
              >
                <Text style={{ color: '#fff', fontSize: 40, paddingBottom: 5 }}>+</Text>
              </TouchableOpacity>
            </View>
          ),
        }}
      />

      <Tabs.Screen
        name="profile"
        options={{
          tabBarIcon: ({ focused }) => (
            <Ionicons
              name="person"
              size={26}
              color={focused ? "#FF7B00" : "#999"}
            />
          ),
        }}
      />
    </Tabs>
  );
}

const styles = StyleSheet.create({
  AbsoluteFillStyle: {
    position: 'absolute',
    left: 0,
    right: 0,
    top: 0,
    bottom: 0,
  },
  tabBarBackground: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    height: 90,
  },
  floatingButtonContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  floatingButton: {
    top: -40,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#FF7B00',
    width: 60,
    height: 60,
    borderRadius: 15,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.25,
    shadowRadius: 10,
    elevation: 10,
  },
});