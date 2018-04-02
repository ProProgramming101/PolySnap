
import React from 'react';
import { View, Text, Image, StyleSheet, TouchableOpacity } from 'react-native';

export default class GooglePolyAsset extends React.Component {

    static defaultProps = {
        asset: { },
        onPress: function(asset) { },
    }

    render() {
        return (
            <TouchableOpacity style={styles.container} onPress={() => this.props.onPress(this.props.asset)}>
                <Image source={{uri: this.props.asset.thumbnail.url }} style={styles.thumbnail} />
                <Text style={styles.displayName}>{this.props.asset.displayName}</Text>
                <Text style={styles.authorName}>{this.props.asset.authorName}</Text>
            </TouchableOpacity>
        );
    }
}

const styles = StyleSheet.create({
    container: { padding: 10, },
    thumbnail: { width: 150, height: 150, borderRadius: 10, },
    displayName: { fontWeight: "bold", textAlign: "center", width: 150, },
    authorName: { textAlign: "center", width: 150, },
})