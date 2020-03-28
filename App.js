import React,{Component} from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { createAppContainer } from 'react-navigation';
import { createStackNavigator } from 'react-navigation-stack';
import Login from './screens/LoginPage';
import Loading from './screens/LoadingPage';
import Main from './screens/MainPage';
import Register from './screens/RegisterPage';

const AppNavigator = createStackNavigator(
   {
      LoadingScreen: Loading,
      LoginScreen: Login,
      RegisterScreen: Register,
      MainScreen:Main,
      
   },
  {
    initialRouteName: 'LoadingScreen',
  },
);

const AppContainer = createAppContainer(AppNavigator);

 export default class App extends React.Component {
   render() {
     return <AppContainer />;
   }
 }