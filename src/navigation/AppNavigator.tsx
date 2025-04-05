import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import QuestionScreen from '../screens/QuestionScreen';
import LessonScreen from '../screens/LessonScreen';
import MainScreen from '../screens/MainScreen';
import StudyScreen from '../screens/StudyScreen';
import StudyResultsScreen from '../screens/StudyResultsScreen';
import StatsScreen from '../screens/StatsScreen';

// Define the types for our navigation
export type RootStackParamList = {
  Main: undefined;
  Question: { questionId: string; studySessionId?: string };
  Lesson: { questionId: string; studySessionId?: string };
  Study: undefined;
  StudyResults: { studySessionId: string };
  Stats: undefined;
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
        <Stack.Screen
          name="Study"
          component={StudyScreen}
          options={{ title: 'Estudo Personalizado' }}
        />
        <Stack.Screen
          name="StudyResults"
          component={StudyResultsScreen}
          options={{ title: 'Resultados do Estudo' }}
        />
        <Stack.Screen
          name="Stats"
          component={StatsScreen}
          options={{ title: 'Estatísticas' }}
        />
      </Stack.Navigator>
    </NavigationContainer>
  );
};

export default AppNavigator;
