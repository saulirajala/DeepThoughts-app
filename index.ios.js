/**
 * DeepThoughts App v 0.4
 * Original by Jeff Gould (https://deliciousbrains.com/wp-rest-api-customizing-endpoints-adding-new-ones/)
 *
 * Modified by Sauli Rajala
 */
'use strict';

import React, {Component} from 'react';
import {
    AppRegistry,
    StyleSheet,
    Text,
    View,
    TouchableHighlight,
} from 'react-native';

var REQUEST_URL_BASE = 'http://your-server/wp-json/';
var POSTS_URL_PATH    = 'wp/v2/posts/';
var GET_POST_IDS_PATH = 'deep-thoughts/v1/get-all-post-ids';
var AUTH_TOKEN = '';


var DeepThoughts = React.createClass( {
    getInitialState: function() {
        return {
            //thought is initially set to null so that the loading message shows
            thought: null,
            thoughtIDs: null,
            currentID: null
        };
    },
    // Automatically called by react when this component has finished mounting.
    componentDidMount: function() {
        this.getAllIDs();
    },
    getAllIDs: function(){
        fetch(REQUEST_URL_BASE + GET_POST_IDS_PATH)
            .then((response) => response.json())
            .then((responseData) => {
                // this.setState() will cause the new data to be applied to the UI that is created by the `render` function below
                this.setState({
                    thoughtIDs: responseData
                });
            })
            .then(this.fetchData)
            .done();
    },
    getRandID: function() {
        var currentID = this.state.thoughtIDs[Math.floor(Math.random()*this.state.thoughtIDs.length)];

        // Don't show the same "thought" twice - recursively call this function again if old and new IDs are the same
        if ( this.state.currentID === currentID ) {
            currentID = this.getRandID();
        } else {
            this.setState( {
                currentID: currentID
            } );
        }

        return currentID;
    },
    // This is where the magic happens! Fetches the data from our API and updates the application state.
    fetchData: function() {
        var currentID = this.getRandID();
        this.setState( {
            // we'll also set thought to null when loading new thoughts so that the loading message shows
            thought: null
        } );
        fetch(REQUEST_URL_BASE + POSTS_URL_PATH + currentID)
            .then( (response) => response.json() )
            .then( (responseData) => {
                // this.setState() will cause the new data to be applied to the UI that is created by the `render` function below
                this.setState( {
                    thought: { title: responseData.title.rendered, content: responseData.plaintext, goodReviews: responseData.goodReviews, badReviews: responseData.badReviews }
                } );
            } )
            .done();
    },
    sendReview: function(review_type) {
        fetch(REQUEST_URL_BASE + POSTS_URL_PATH + this.state.currentID + '?'+review_type+'Reviews=1', {
            method: 'POST',
            headers: {
                'Accept': 'application/json',
                'Content-Type': 'application/json',
                "Authorization": "Basic " + AUTH_TOKEN,
            },
        })
        .done(this.fetchData());
    },
    // instead of immediately rendering the template, we now check if there is data in the 'thought' variable
    // and render a loading view if it's empty, or the 'thought' template if there is data
    render: function() {
        if ( !this.state.thought ) {
            return this.renderLoadingView();
        }
        return this.renderThought();
    },
    // the loading view template just shows the message "Thinking thoughts..."
    renderLoadingView: function() {
        return (
            <View style={styles.container}>
                <Text>
                    Thinking thoughts...
                </Text>
            </View>
        );
    },
    // this is the original render function, now renamed to renderThought, which will render our main template
    renderThought: function() {
        return (
            <View style={styles.container}>
                <View style={styles.textContainer}>
                    <Text style={styles.title}>
                        {this.state.thought.title}
                    </Text>
                    <Text style={styles.text}>
                        {this.state.thought.content}
                    </Text>
                </View>
                <View style={styles.reviewsContainer}>
                    <Text style={styles.title}>
                        Reviews
                    </Text>
                    <Text style={[styles.text, styles.greenText]}>
                        Good: {this.state.thought.goodReviews}
                    </Text>
                    <Text style={[styles.text, styles.redText]}>
                        Bad: {this.state.thought.badReviews}
                    </Text>
                </View>
                <View style={styles.buttonsContainer}>
                    <View style={[styles.buttonContainer, styles.bad]}>
                        <TouchableHighlight
                            style={styles.button}
                            underlayColor='#fff'
                            onPress={()=>this.sendReview('bad')}
                        >
                            <Text style={styles.buttonText}>Bad one!</Text>
                        </TouchableHighlight>
                    </View>
                    <View style={[styles.buttonContainer, styles.good] }>
                        <TouchableHighlight
                            style={styles.button}
                            underlayColor='#ccc'
                            onPress={()=>this.sendReview('good')}
                        >
                            <Text style={styles.buttonText}>Good one!</Text>
                        </TouchableHighlight>
                    </View>
                </View>
            </View>
        );
    }
} );

var Dimensions = require( 'Dimensions' );
var windowSize = Dimensions.get( 'window' );

var styles = StyleSheet.create( {
    container: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: '#FFFFFF',
    },
    textContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },
    title: {
        fontSize: 30,
        textAlign: 'center',
        margin: 10,
    },
    text: {
        fontSize: 18,
        paddingLeft: 20,
        paddingRight: 20,
        textAlign: 'center',
        color: '#333333',
        marginBottom: 5,
    },
    redText: {
        color: '#DF0101',
    },
    greenText: {
        color: '#088A08',
    },
    reviewsContainer: {
        width: windowSize.width,
        backgroundColor: '#eee',
        flex: .5,
        alignItems: 'center',
        justifyContent: 'center',
    },
    buttonContainer: {
        bottom: 0,
        flex: .1,
        width: windowSize.width / 2,
        backgroundColor: '#eee',
    },
    bad: {
        backgroundColor: '#DF0101',
    },
    good: {
        backgroundColor: '#088A08',
    },
    buttonsContainer: {
        flex: .2,
        width: windowSize.width,
        flexDirection: 'row',
    },
    button: {
        flex: 1,
        alignItems: 'center',
        justifyContent: 'center',

    },
    buttonText: {
        fontSize: 30,
        color: '#fff',
    },
} );

AppRegistry.registerComponent( 'DeepThoughts', () => DeepThoughts );