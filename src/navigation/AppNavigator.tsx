import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import QuestionScreen from '../screens/QuestionScreen';
import LessonScreen from '../screens/LessonScreen';
import MainScreen from '../screens/MainScreen';
import StudyScreen from '../screens/StudyScreen';
import StudyResultsScreen from '../screens/StudyResultsScreen';
import StatsScreen from '../screens/StatsScreen';
import ModelDownloadScreen from '../screens/ModelDownloadScreen';
import SupportScreen from '../screens/SupportScreen';
import EssayScreen from '../screens/EssayScreen';
import EssayInputScreen from '../screens/EssayInputScreen';
import EssayResultScreen from '../screens/EssayResultScreen';
import ExamsListScreen from '../screens/ExamsListScreen';
import ExamDetailScreen from '../screens/ExamDetailScreen';
import ImageTestScreen from '../screens/ImageTestScreen';

// Define the types for our navigation
export type RootStackParamList = {
  Main: undefined;
  Question: { questionId: string; studySessionId?: string };
  Lesson: { questionId: string; studySessionId?: string };
  Study: undefined;
  StudyResults: { studySessionId: string };
  Stats: undefined;
  ModelDownload: undefined;
  Support: undefined;
  Essay: undefined;
  EssayInput: undefined;
  EssayResult: { evaluationId: string };
  ExamsList: undefined;
  ExamDetail: { examYear: number; examType: string };
  ImageTest: undefined;
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
        <Stack.Screen
          name="ModelDownload"
          component={ModelDownloadScreen}
          options={{ title: 'Download de Modelo' }}
        />
        <Stack.Screen
          name="Support"
          component={SupportScreen}
          options={{ title: 'Apoie o Desenvolvedor' }}
        />
        <Stack.Screen
          name="Essay"
          component={EssayScreen}
          options={{ title: 'Redação ENEM' }}
        />
        <Stack.Screen
          name="EssayInput"
          component={EssayInputScreen}
          options={{ title: 'Digitar Redação' }}
        />
        <Stack.Screen
          name="EssayResult"
          component={EssayResultScreen}
          options={{ title: 'Resultado da Avaliação' }}
        />
        <Stack.Screen
          name="ExamsList"
          component={ExamsListScreen}
          options={{ title: 'Provas Disponíveis' }}
        />
        <Stack.Screen
          name="ExamDetail"
          component={ExamDetailScreen}
          options={({ route }) => ({
            title: `ENEM ${route.params.examYear} - ${route.params.examType}`
          })}
        />
        <Stack.Screen
          name="ImageTest"
          component={ImageTestScreen}
          options={{ title: 'Teste de Imagens' }}
        />
      </Stack.Navigator>
    </NavigationContainer>
  );
};

export default AppNavigator;
