import React, { Component } from 'react';
import { StyleSheet, Text, View, Image, KeyboardAvoidingView } from 'react-native';
import { Item, Input, Label, Button } from 'native-base';
import * as firebase from 'firebase';
import Spinner from 'react-native-loading-spinner-overlay';

export default class Login extends Component {
    static navigationOptions = {
        headerShown: false
    }
	
	constructor(props) {
		super(props);
		this.state = { 
		email: '',emailErrorFlag:false,emailSuccessFlag:false,
		Password:'',PasswordErrorFlag:false,PasswordSuccessFlag:false,
		spinner: false};
	}
    
    componentDidMount() {
        this.setState({email: '', Password:''});
    }
	checkemail(emailId)
	{
		if(emailId.length>10 && emailId.includes("@gmail.com"))
		{
			this.setState({email:emailId,emailErrorFlag:false,emailSuccessFlag:true});
		}
		else
		{
			this.setState({email:emailId,emailErrorFlag:true,emailSuccessFlag:false});
		}
	}
	
	checkPassword(Pswd)
	{
		if(Pswd.length>=6)
		{
			this.setState({Password:Pswd,PasswordErrorFlag:false,PasswordSuccessFlag:true});
		}
		else
		{
			this.setState({Password:Pswd,PasswordErrorFlag:true,PasswordSuccessFlag:false});
		}
	}
	
	verifyDataAndLogin()
	{
		this.setState({spinner:true});
		firebase
		.auth()
		.signInWithEmailAndPassword(this.state.email, this.state.Password)
		.then(() => this.props.navigation.navigate('MainScreen'))
		.catch(error => alert(error));	
		
		this.setState({spinner:false});
	}
	
    render() {
        return (
            <View style={styles.MainContainer}>

				<Spinner visible={this.state.spinner} textContent={'Loading...'} textStyle={styles.spinnerTextStyle} />
                <View style={styles.ImageContainer}>
                    <Image source={require('../assets/logo.png')}
                        style={styles.ImageStyle}
                    />
                </View>

                <KeyboardAvoidingView style={styles.FormContainer} behavior="padding" enabled>

                    <Text style={styles.LoginText}>Login</Text>

                    <Item floatingLabel error={this.state.emailErrorFlag} success={this.state.emailSuccessFlag} style={styles.InputBox}>
                        <Label>Email</Label>
                        <Input onChangeText={(email) => this.checkemail(email)} value={this.state.email}/>
                    </Item>

                    <Item floatingLabel error={this.state.PasswordErrorFlag} success={this.state.PasswordSuccessFlag} style={styles.InputBox}>
                        <Label>Password</Label>
                        <Input secureTextEntry={true} onChangeText={(Password) => this.checkPassword(Password)} value={this.state.Password}/>
                    </Item>

                    <Button dark style={styles.ButtonBox} onPress={this.verifyDataAndLogin.bind(this)}>
                        <Text style={styles.ButtonText}>Login</Text>
                    </Button>

                    <Text style={styles.SignInText}>Not a Customer? 
                        <Text onPress={() => this.props.navigation.navigate('RegisterScreen')} style={{color:'#3483eb'}}> Register </Text>
                    </Text>
                </KeyboardAvoidingView>
            </View>
        );
    }
}

const styles = StyleSheet.create({
    MainContainer: {
        flex: 1,
        marginTop:-20,
    },

    ImageStyle: {
        width: '75%',
        height: '100%',
        resizeMode: 'contain',
		marginTop:50,
    },

    ImageContainer: {
        flex: 0.48,
        backgroundColor: '#fff',
        alignItems: 'center',
        justifyContent: 'center',
    },

    FormContainer: {
        flex: 0.52,
        backgroundColor: '#fff',
        alignItems: 'center',
        justifyContent: 'space-evenly',
        margin: 15,
    },

    InnerBoxContainer: {
        borderRadius: 4,
        borderWidth: 3,
        borderColor: '#000000',
    },

    LoginText: {
        alignSelf: 'center',
        fontSize: 30,
        marginTop: 20,
        marginBottom: 10,
    },

    InputBox: {
        alignSelf: 'center',
        marginLeft: 20,
		marginRight:20,
		marginBottom:20,
		marginTop:10,
    },

    ButtonBox: {
        margin:20,
        alignSelf: 'stretch',
        justifyContent: 'center'
    },

    ButtonText: {
        alignSelf: 'center',
        color: 'white',
        fontSize: 20,
    },

    SignInText: {
        margin: 10,
        fontSize: 15,
    }

});
