import React from 'react';
import { StyleSheet, View, Text, ScrollView } from 'react-native';
import { Button } from 'native-base';
import * as firebase from 'firebase';
import 'firebase/firestore';
import * as d3 from 'd3';
import { decode, encode } from 'base-64';

if (!global.btoa) { global.btoa = encode }
if (!global.atob) { global.atob = decode }

export default class Main extends React.Component {
	static navigationOptions = {
		headerShown: false
	}

	constructor(props) {
		super(props);
		console.ignoredYellowBox = [
			'Setting a timer'
		];
		this.state = { max10: 0, idealRow: [], differenceValues: [] };
	}

	componentDidMount() {
		// let temp1=0;
		// let temp2=[];
		console.log("componentDidMount");
		firebase.firestore().collection("collections").doc("documents").onSnapshot((doc) => {
			if (doc.exists) {
				this.setState({ max10: doc.data().maxValue, idealRow: doc.data().idealValues });
				console.log("max10-" + this.state.max10 + " idealRows-" + this.state.idealRow);
			}
			else {
				console.log("no document found");
			}
		});
	}

	calculatingPara10() {
		firebase.storage().ref('data.csv').getDownloadURL().then(function (url) {
			d3.csv(url).then(function (result) {
				var len = result.length;
				if (len == 1) {
					let temp = result[0]['Para-010'] / 5;
					this.setState({ max10: temp, idealRow: result[0] });
				}
				else {
					// calculating delta 10
					let delta10 = (result[len - 1]['Para-010'] - result[len - 2]['Para-010']) / 5;
					if (delta10 > this.state.max10) {
						// current row is ideal one so update the ideal conditions
						this.setState({ max10: delta10, idealRow: result[len - 1] });
					}
					else if (delta10 < this.state.max10) {
						// difference of two rows for all the parameters with ideal row
						var temp = [];
						for (let i = 2; i < result.columns.length; i++) {
							let key = result.columns[i];
							temp[key] = this.state.idealRow[key] - result[len - 1][key];
						}
						this.setState({ differenceValues: temp });
					}
					else if (delta10 == this.state.max10) {
						console.log("In Para 6");
						// comparing parameter 6
						let currPara6 = result[len - 1]['Para-006'];
						let prevPara6 = this.state.idealRow['Para-006'];

						if (currPara6 < prevPara6) {
							// current row is the ideal one
							this.setState({ idealRow: result[len - 1] });
						}
						else if (currPara6 > prevPara6) {
							// previous row was the ideal one
							// difference of two rows for all the parameters
							var temp = [];
							for (let i = 2; i < result.columns.length; i++) {
								let key = result.columns[i];
								temp[key] = this.state.idealRow[key] - result[len - 1][key];
							}
							this.setState({ differenceValues: temp });
						}
						else if (currPara6 == prevPara6) {
							console.log("In Para 1");
							// calculating delta 1
							let currdelta1 = 0;
							let prevdelta1 = 0;
							if (len == 2) {
								currdelta1 = (result[len - 1]['Para-001'] - result[len - 2]['Para-001']) / 5;
								prevdelta1 = (result[len - 2]['Para-001']) / 5;
							}
							else {
								currdelta1 = (result[len - 1]['Para-001'] - result[len - 2]['Para-001']) / 5;
								prevdelta1 = (result[len - 2]['Para-001'] - result[len - 3]['Para-001']) / 5;
							}

							if (currdelta1 < prevdelta1) {
								// previous row was ideal one
								// difference of two rows for all the parameters
								var temp = [];
								for (let i = 2; i < result.columns.length; i++) {
									let key = result.columns[i];
									temp[key] = this.state.idealRow[key] - result[len - 1][key];
								}
								this.setState({ differenceValues: temp });
							}
							else {
								// current row is ideal one
								this.setState({ idealRow: result[len - 1] });
							}
						}
					}
				}

				if (firebase.auth().currentUser) {
					const firestore = firebase.firestore();
					firestore.collection("collections").doc("documents").update({
						maxValue: this.state.max10,
						idealValues: this.state.idealRow
					});
				}

			}.bind(this))
		}.bind(this), function (error) {
			console.log(error);
		});
	}

	logout() {
		firebase.auth().signOut()
			.then(() => this.props.navigation.navigate('LoginScreen'))
	}

	render() {
		return (
			<View style={styles.container}>
				<ScrollView style={styles.ScrollStyle}>
					<Text style={styles.TextStyle}>Parameter 1 - {this.state.differenceValues['Para-001']} </Text>
					<Text style={styles.TextStyle}>Parameter 2 - {this.state.differenceValues['Para-002']}</Text>
					<Text style={styles.TextStyle}>Parameter 3 - {this.state.differenceValues['Para-003']}</Text>
					<Text style={styles.TextStyle}>Parameter 4 - {this.state.differenceValues['Para-004']}</Text>
					<Text style={styles.TextStyle}>Parameter 5 - {this.state.differenceValues['Para-005']}</Text>
					<Text style={styles.TextStyle}>Parameter 6 - {this.state.differenceValues['Para-006']}</Text>
					<Text style={styles.TextStyle}>Parameter 7 - {this.state.differenceValues['Para-007']}</Text>
					<Text style={styles.TextStyle}>Parameter 8 - {this.state.differenceValues['Para-008']}</Text>
					<Text style={styles.TextStyle}>Parameter 9 - {this.state.differenceValues['Para-009']}</Text>
					<Text style={styles.TextStyle}>Parameter 10 -{this.state.differenceValues['Para-010']}</Text>
					<Text style={styles.TextStyle}>Parameter 11 -{this.state.differenceValues['Para-011']}</Text>
					<Text style={styles.TextStyle}>Parameter 12 -{this.state.differenceValues['Para-012']}</Text>
					<Text style={styles.TextStyle}>Parameter 13 -{this.state.differenceValues['Para-013']}</Text>
					<Text style={styles.TextStyle}>Parameter 14 -{this.state.differenceValues['Para-014']}</Text>
					<Text style={styles.TextStyle}>Parameter 15 -{this.state.differenceValues['Para-015']}</Text>
					<Text style={styles.TextStyle}>Parameter 16 -{this.state.differenceValues['Para-016']}</Text>
					<Text style={styles.TextStyle}>Parameter 17 -{this.state.differenceValues['Para-017']}</Text>
					<Text style={styles.TextStyle}>Parameter 18 -{this.state.differenceValues['Para-018']}</Text>
				</ScrollView>
				<View style={styles.Innercontainer}>
					<Button dark style={styles.ButtonBox} onPress={this.calculatingPara10.bind(this)}>
						<Text style={styles.ButtonText}>Calculate</Text>
					</Button>
					<Button dark style={styles.ButtonBox} onPress={this.logout.bind(this)}>
						<Text style={styles.ButtonText}>Logout</Text>
					</Button>
				</View>
			</View>
		);
	}
}

const styles = StyleSheet.create({
	container: {
		flex: 1,
		backgroundColor: '#ededed',
		justifyContent: 'center'
	},
	ScrollStyle: {
		flex: 0.75,
		margin: 50,
	},
	Innercontainer: {
		flex: 0.25,
		backgroundColor: '#ededed',
		justifyContent: 'flex-end'
	},
	TextStyle: {
		fontSize: 25,
	},
	ButtonBox: {
		margin: 20,
		marginTop: 10,
		alignSelf: 'stretch',
		justifyContent: 'center'
	},

	ButtonText: {
		alignSelf: 'center',
		color: 'white',
		fontSize: 20,
	},
})