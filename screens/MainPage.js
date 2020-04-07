import React from 'react';
import {StyleSheet, View, Text, ScrollView} from 'react-native';
import {Button} from 'native-base';
import * as firebase from 'firebase';
import 'firebase/firestore';
import * as d3 from 'd3';
import {decode, encode} from 'base-64';
import Spinner from 'react-native-loading-spinner-overlay';


if (!global.btoa) {
    global.btoa = encode
}
if (!global.atob) {
    global.atob = decode
}

export default class Main extends React.Component {
    static navigationOptions = {
        headerShown: false
    }

    constructor(props) {
        super(props);
        console.ignoredYellowBox = [
            'Setting a timer'
        ];
        this.state = {idealDelta10: 0,idealDelta1: 0, idealRow: [], differenceValues: [], spinner: false, update: false};
        this.getDisplayTextStyle = this.getDisplayTextStyle.bind(this)
    }

    componentDidMount() {
        console.log("componentDidMount");
        firebase.firestore().collection("collections").doc("documents").onSnapshot((doc) => {
            if (doc.exists) {
                this.setState({idealDelta10: parseFloat(doc.data().idealDelta10),idealDelta1: parseFloat(doc.data().idealDelta1), idealRow: doc.data().idealValues});
                console.log("value idealDelta10-" + this.state.idealDelta10 + " idealDelta1- "+ this.state.idealDelta1 +" idealRows-" + this.state.idealRow);
            } else {
                console.log("no document found");
            }
        });
    }


    calculatingPara10() {
        this.setState({spinner: true, update: false, differenceValues: []});
        firebase.storage().ref('data.csv').getDownloadURL().then(function (url) {
            d3.csv(url).then(function (result) {
                let len = result.length;
                console.log("Length of file: ", len)
                if(len==0){
                    console.log("No data found");
                }else if (len == 1) {
                    let currentDelta10 = parseInt(result[0]['Para-010']) / 5;
                    let currentDelta1  = parseInt(result[0]['Para-001']) / 5;
                    this.setState({idealDelta10: currentDelta10,idealDelta1: currentDelta1, idealRow: result[0], update: true});
                } else {
                    // calculating delta 10
                    let currentDelta10 = ((parseInt(result[len - 1]['Para-010']) - parseInt(result[len - 2]['Para-010'])) / 5);
                    
                    if (currentDelta10 > this.state.idealDelta10) {
                        // calculating delta 1
                        let currentDelta1 = ((parseInt(result[len - 1]['Para-001']) - parseInt(result[len - 2]['Para-001'])) / 5);
                        // current row is ideal one so update the ideal conditions
                        this.setState({idealDelta10: currentDelta10,idealDelta1: currentDelta1, idealRow: result[len - 1], update: true});
                    } else if (currentDelta10 < this.state.idealDelta10) {
                        // difference of two rows for all the parameters with ideal row
                        var temp = [];
                        for (let i = 2; i < result.columns.length; i++) {
                            let key = result.columns[i];
                            temp[key] = parseInt(this.state.idealRow[key]) - parseInt(result[len - 1][key]);
                        }
                        this.setState({differenceValues: temp});
                    } else if (currentDelta10 == this.state.idealDelta10) {
                        console.log("In Para 6");
                        // comparing parameter 6
                        let currPara6 = parseInt(result[len - 1]['Para-006']);
                        let prevPara6 = parseInt(this.state.idealRow['Para-006']);

                        if (currPara6 < prevPara6) {
                            // calculating delta 1
                            let currentDelta1 = ((parseInt(result[len - 1]['Para-001']) - parseInt(result[len - 2]['Para-001'])) / 5);
                            // current row is the ideal one
                            this.setState({idealDelta1: currentDelta1,idealRow: result[len - 1], update: true});
                        } else if (currPara6 > prevPara6) {
                            // previous row was the ideal one
                            // difference of two rows for all the parameters
                            var temp = [];
                            for (let i = 2; i < result.columns.length; i++) {
                                let key = result.columns[i];
                                temp[key] = parseInt(this.state.idealRow[key]) - parseInt(result[len - 1][key]);
                            }
                            this.setState({differenceValues: temp});
                        } else if (currPara6 == prevPara6) {
                            console.log("In Para 1");
                            // calculating delta 1
                            let currentDelta1 = (parseInt(result[len - 1]['Para-001']) - parseInt(result[len - 2]['Para-001'])) / 5;
                            if (currentDelta1 < this.state.idealDelta1) {
                                // previous row was ideal one
                                // difference of two rows for all the parameters
                                var temp = [];
                                for (let i = 2; i < result.columns.length; i++) {
                                    let key = result.columns[i];
                                    temp[key] = parseInt(this.state.idealRow[key]) - parseInt(result[len - 1][key]);
                                }
                                this.setState({differenceValues: temp});
                            } else {
                                // current row is ideal one
                                this.setState({idealDelta1: currentDelta1,idealRow: result[len - 1], update: true});
                            }
                        }
                    }
                }

                if (firebase.auth().currentUser && this.state.update === true) {
                    console.log("Updating Firebase");
                    const firestore = firebase.firestore();
                    firestore.collection("collections").doc("documents").update({
                        idealDelta10: this.state.idealDelta10,
                        idealDelta1: this.state.idealDelta1,
                        idealValues: this.state.idealRow
                    });
                }
				this.setState({spinner: false});

				// if(this.state.differenceValues['Para-001'] === undefined){
				// 	console.log("Inside ideal row");
				// 	alert("Current row is ideal one and no need to change any parameter");
				// }
            }.bind(this))
        }.bind(this), function (error) {
            console.log(error);
        });
    }

    logout() {
        firebase.auth().signOut()
            .then(() => this.props.navigation.navigate('LoginScreen'))
    }

    getDisplayTextStyle(value) {
        if (value <= 0)
            return styles.RedOutputText
        else
            return styles.GreenOutputText
    }

    reset() {
        console.log("resetting Firebase");
        const firestore = firebase.firestore();

        firestore.collection("collections").doc("documents").update({
            idealDelta10: 0,
            idealDelta1: 0,
            idealValues: []
        }).then(() => this.setState({idealDelta10: 0,idealDelta1: 0, idealRow: [], differenceValues: [], spinner: false, update: false}))
        console.log("reset complete")
    }

    render() {
        return (
            <View style={styles.container}>
                <Spinner visible={this.state.spinner} textContent={'Loading...'} textStyle={styles.spinnerTextStyle}/>
                <ScrollView style={styles.ScrollStyle}>
                    <Text style={styles.TextStyle}>Parameter 01 : <Text
                        style={this.getDisplayTextStyle(this.state.differenceValues['Para-001'])}>{this.state.differenceValues['Para-001']==undefined ? 'No change' : this.state.differenceValues['Para-001']}</Text></Text>
                    <Text style={styles.TextStyle}>Parameter 02 : <Text
                        style={this.getDisplayTextStyle(this.state.differenceValues['Para-002'])}>{this.state.differenceValues['Para-002']==undefined ? 'No change' : this.state.differenceValues['Para-002']}</Text></Text>
                    <Text style={styles.TextStyle}>Parameter 03 : <Text
                        style={this.getDisplayTextStyle(this.state.differenceValues['Para-003'])}>{this.state.differenceValues['Para-003']==undefined ? 'No change' : this.state.differenceValues['Para-003']}</Text></Text>
                    <Text style={styles.TextStyle}>Parameter 04 : <Text
                        style={this.getDisplayTextStyle(this.state.differenceValues['Para-004'])}>{this.state.differenceValues['Para-004']==undefined ? 'No change' : this.state.differenceValues['Para-004']}</Text></Text>
                    <Text style={styles.TextStyle}>Parameter 05 : <Text
                        style={this.getDisplayTextStyle(this.state.differenceValues['Para-005'])}>{this.state.differenceValues['Para-005']==undefined ? 'No change' : this.state.differenceValues['Para-005']}</Text></Text>
                    <Text style={styles.TextStyle}>Parameter 06 : <Text
                        style={this.getDisplayTextStyle(this.state.differenceValues['Para-006'])}>{this.state.differenceValues['Para-006']==undefined ? 'No change' : this.state.differenceValues['Para-006']}</Text></Text>
                    <Text style={styles.TextStyle}>Parameter 07 : <Text
                        style={this.getDisplayTextStyle(this.state.differenceValues['Para-007'])}>{this.state.differenceValues['Para-007']==undefined ? 'No change' : this.state.differenceValues['Para-007']}</Text></Text>
                    <Text style={styles.TextStyle}>Parameter 08 : <Text
                        style={this.getDisplayTextStyle(this.state.differenceValues['Para-008'])}>{this.state.differenceValues['Para-008']==undefined ? 'No change' : this.state.differenceValues['Para-008']}</Text></Text>
                    <Text style={styles.TextStyle}>Parameter 09 : <Text
                        style={this.getDisplayTextStyle(this.state.differenceValues['Para-009'])}>{this.state.differenceValues['Para-009']==undefined ? 'No change' : this.state.differenceValues['Para-009']}</Text></Text>
                    <Text style={styles.TextStyle}>Parameter 10 : <Text
                        style={this.getDisplayTextStyle(this.state.differenceValues['Para-010'])}>{this.state.differenceValues['Para-010']==undefined ? 'No change' : this.state.differenceValues['Para-010']}</Text></Text>
                    <Text style={styles.TextStyle}>Parameter 11 : <Text
                        style={this.getDisplayTextStyle(this.state.differenceValues['Para-011'])}>{this.state.differenceValues['Para-011']==undefined ? 'No change' : this.state.differenceValues['Para-011']}</Text></Text>
                    <Text style={styles.TextStyle}>Parameter 12 : <Text
                        style={this.getDisplayTextStyle(this.state.differenceValues['Para-012'])}>{this.state.differenceValues['Para-012']==undefined ? 'No change' : this.state.differenceValues['Para-012']}</Text></Text>
                    <Text style={styles.TextStyle}>Parameter 13 : <Text
                        style={this.getDisplayTextStyle(this.state.differenceValues['Para-013'])}>{this.state.differenceValues['Para-013']==undefined ? 'No change' : this.state.differenceValues['Para-013']}</Text></Text>
                    <Text style={styles.TextStyle}>Parameter 14 : <Text
                        style={this.getDisplayTextStyle(this.state.differenceValues['Para-014'])}>{this.state.differenceValues['Para-014']==undefined ? 'No change' : this.state.differenceValues['Para-014']}</Text></Text>
                    <Text style={styles.TextStyle}>Parameter 15 : <Text
                        style={this.getDisplayTextStyle(this.state.differenceValues['Para-015'])}>{this.state.differenceValues['Para-015']==undefined ? 'No change' : this.state.differenceValues['Para-015']}</Text></Text>
                    <Text style={styles.TextStyle}>Parameter 16 : <Text
                        style={this.getDisplayTextStyle(this.state.differenceValues['Para-016'])}>{this.state.differenceValues['Para-016']==undefined ? 'No change' : this.state.differenceValues['Para-016']}</Text></Text>
                    <Text style={styles.TextStyle}>Parameter 17 : <Text
                        style={this.getDisplayTextStyle(this.state.differenceValues['Para-017'])}>{this.state.differenceValues['Para-017']==undefined ? 'No change' : this.state.differenceValues['Para-017']}</Text></Text>
                    <Text style={styles.TextStyle}>Parameter 18 : <Text
                        style={this.getDisplayTextStyle(this.state.differenceValues['Para-018'])}>{this.state.differenceValues['Para-018']==undefined ? 'No change' : this.state.differenceValues['Para-018']}</Text></Text>
                </ScrollView>
                <View style={styles.Innercontainer}>
                    <Button dark style={styles.ButtonBox} onPress={this.calculatingPara10.bind(this)}>
                        <Text style={styles.ButtonText}>Calculate</Text>
                    </Button>
                    <Button dark style={styles.ButtonBox} onPress={this.logout.bind(this)}>
                        <Text style={styles.ButtonText}>Logout</Text>
                    </Button>
                    <Button dark style={styles.ButtonBox} onPress={this.reset.bind(this)}>
                        <Text style={styles.ButtonText}>Reset Values</Text>
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
    spinnerTextStyle: {
        color: '#FFF'
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
        margin: 5,
        marginTop: 5,
        alignSelf: 'stretch',
        justifyContent: 'center'
    },

    ButtonText: {
        alignSelf: 'center',
        color: 'white',
        fontSize: 20,
    },

    RedOutputText: {
        color: 'red',
    },

    GreenOutputText: {
        color: 'green',
    }

})