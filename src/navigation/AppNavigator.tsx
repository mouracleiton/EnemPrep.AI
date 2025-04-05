import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import QuestionScreen from '../screens/QuestionScreen';
import LessonScreen from '../screens/LessonScreen';
import MainScreen from '../screens/MainScreen';

// Define the types for our navigation
export type RootStackParamList = {
  Main: undefined;
  Question: { questionId: string };
  Lesson: { questionId: string };
};

const Stack = createNativeStackNavigator<RootStackParamList>();

// Root stack navigator
const AppNavigator = () => {
  return (
    <NavigationContainer>
      <Stack.Navigator>
        <Stack.Screen
          name="Main"
          component={MainScreen}
          options={{ title: 'ENEM Prep' }}
        />
        <Stack.Screen
          name="Question"
          component={QuestionScreen}
          options={{ title: 'Questão' }}
        />
        <Stack.Screen
          name="Lesson"
          component={LessonScreen}
          options={{ title: 'Aula' }}
        />
      </Stack.Navigator>
    </NavigationContainer>
  );
};

export default AppNavigator;
