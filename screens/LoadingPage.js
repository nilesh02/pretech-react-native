import React from 'react';
import { View, Text, ActivityIndicator, StyleSheet,YellowBox  } from 'react-native';
import * as firebase from 'firebase';

export default class Loading extends React.Component {
    static navigationOptions = {
        headerShown: false
    }
    componentDidMount() {
        YellowBox.ignoreWarnings(['Setting a timer']);
        
        const firebaseConfig = {
            apiKey: "AIzaSyBPRy468mWKldsZ2yx2dyzL8PSCE7rlMJk",
            authDomain: "sample-2216b.firebaseapp.com",
            databaseURL: "https://sample-2216b.firebaseio.com",
            projectId: "sample-2216b",
            storageBucket: "sample-2216b.appspot.com",
            messagingSenderId: "714106496514",
            appId: "1:714106496514:web:40a17f5f0af225dea1691b",
            measurementId: "G-60N4PNB2QH"
          };

        firebase.initializeApp(firebaseConfig);

        firebase.auth().onAuthStateChanged(user => {
            this.props.navigation.navigate(user ? 'MainScreen' : 'LoginScreen')
        })
    }

    render() {
        return (
            <View style={styles.container}>
                <Text>Loading</Text>
                <ActivityIndicator size="large" />
            </View>
        )
    }
}
const styles = StyleSheet.create({
    container: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    }
})