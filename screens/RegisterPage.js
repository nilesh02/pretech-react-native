import React, { Component } from 'react';
import { StyleSheet, Text, View, Image, KeyboardAvoidingView, ScrollView, ActivityIndicator } from 'react-native';
import { Form, Item, Input, Label, Card, CardItem, Button, ListItem, Left, Right, Radio } from 'native-base';
import * as firebase from 'firebase';
import 'firebase/firestore';
import Spinner from 'react-native-loading-spinner-overlay';

export default class Register extends Component {
	static navigationOptions = {
		headerShown: false
	}

	constructor(props) {
		super(props);
		this.state = {
			email: '', emailErrorFlag: false, emailSuccessFlag: false,
			Password: '', PasswordSuccessFlag: false,
			ReTypePassword: '', ReTypeErrorFlag: false, ReTypeSuccessFlag: false,
			spinner: false,
		};
	}

	checkemail(emailId) {
		if (emailId.length>10 && emailId.includes("@gmail.com")) {
			this.setState({ email: emailId, emailErrorFlag: false, emailSuccessFlag: true });
		}
		else {
			this.setState({ email: emailId, emailErrorFlag: true, emailSuccessFlag: false });
		}
	}

	checkPassword(ReTypePswd) {
		if (this.state.Password == ReTypePswd) {
			this.setState({ ReTypePassword: ReTypePswd, ReTypeErrorFlag: false, ReTypeSuccessFlag: true, PasswordSuccessFlag: true });
		}
		else {
			this.setState({ ReTypePassword: ReTypePswd, ReTypeErrorFlag: true, ReTypeSuccessFlag: false, PasswordSuccessFlag: false });
		}
	}

	verifyDataAndReigster() {
		if (this.state.emailSuccessFlag == true && this.state.PasswordSuccessFlag == true) {
			this.setState({ spinner: true });
			firebase
				.auth()
				.createUserWithEmailAndPassword(this.state.email, this.state.Password)
				.then(() => {
					this.setState({spinner:false});
					this.props.navigation.navigate('MainScreen');
				})
				.catch(error => alert(error));
			
		}
		else {
			alert('Please verify the entered invalid data');
		}
	}

	render() {
		return (
			<View style={styles.MainContainer}>

				<Spinner visible={this.state.spinner} textContent={'Loading...'} textStyle={styles.spinnerTextStyle} />

				<KeyboardAvoidingView style={styles.FormContainer} behavior="padding" enabled>
					<ScrollView style={{ flex: 1, alignSelf: 'stretch' }}>
						<Text style={styles.LoginText}>Register</Text>

						<Item floatingLabel error={this.state.emailErrorFlag} success={this.state.emailSuccessFlag} style={styles.InputBox}>
							<Label>Email</Label>
							<Input onChangeText={(email) => this.checkemail(email)} value={this.state.email} />
						</Item>

						<Item floatingLabel success={this.state.PasswordSuccessFlag} style={styles.InputBox}>
							<Label>Password</Label>
							<Input secureTextEntry={true} onChangeText={(Password) => this.setState({ Password })} value={this.state.Password} />
						</Item>

						<Item floatingLabel error={this.state.ReTypeErrorFlag} success={this.state.ReTypeSuccessFlag} style={styles.InputBox}>
							<Label>Re-Type-Password</Label>
							<Input secureTextEntry={true} onChangeText={(ReTypePassword) => this.checkPassword(ReTypePassword)} value={this.state.ReTypePassword} />
						</Item>

						<Button dark style={styles.ButtonBox} onPress={this.verifyDataAndReigster.bind(this)}>
							<Text style={styles.ButtonText}>Register</Text>
						</Button>

						<Text style={styles.SignInText}>Already a Customer?
                        <Text onPress={() => this.props.navigation.navigate('LoginScreen')} style={{ color: '#3483eb' }}> Log In </Text>
						</Text>
					</ScrollView>

				</KeyboardAvoidingView>
			</View>
		);
	}
}

const styles = StyleSheet.create({
	MainContainer: {
		flex: 1,
		marginTop: 35,
	},

	spinnerTextStyle: {
		color: '#FFF'
	},
	FormContainer: {
		flex: 1,
		backgroundColor: '#fff',
		alignItems: 'center',
		justifyContent: 'space-evenly',
		margin: 15,
	},

	LoginText: {
		alignSelf: 'center',
		fontSize: 30,
		marginTop: 20,
		marginBottom: 10,
	},

	InputBox: {
		margin: 7,
		alignSelf: 'center',
		marginLeft: 20
	},

	ButtonBox: {
		margin: 20,
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
		alignSelf: 'center',
	}

});
