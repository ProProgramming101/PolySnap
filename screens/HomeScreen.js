import React from 'react';
import { ScrollView, StyleSheet, Text, View, Image, Button, TextInput, Modal } from 'react-native';
import Expo from 'expo';
import ExpoTHREE, { THREE } from 'expo-three';
import ExpoGraphics from 'expo-graphics';
import { MaterialCommunityIcons as Icon } from 'react-native-vector-icons';
import GooglePoly from './../api/GooglePoly';
import ApiKeys from './../constants/ApiKeys';
import TurkeyObject from './../assets/objects/TurkeyObject.json';
import { SearchableGooglePolyAssetList } from './../components/AppComponents';

console.disableYellowBox = true; 

export default class HomeScreen extends React.Component {
  static navigationOptions = {
    header: null,
  };

  constructor(props) {
    super(props);

    this.googlePoly = new GooglePoly(ApiKeys.GooglePoly);
    this.state = {
      searchModalVisible: false,
      currentAsset: TurkeyObject,
    }
  }

  onContextCreate = async ({gl, scale, width, height, arSession}) => {
    // Initialize renderer...
    this.renderer = ExpoTHREE.createRenderer({gl});
    this.renderer.setPixelRatio(scale);
    this.renderer.setSize(width, height);

    // Initialize scene...
    this.scene = new THREE.Scene();
    this.scene.background = ExpoTHREE.createARBackgroundTexture(arSession, this.renderer);

    // Initialize camera...
    this.camera = ExpoTHREE.createARCamera(arSession, width / scale, height / scale, 0.01, 1000);

    // Initialize lighting...
    var ambientLight = new THREE.AmbientLight(0xaaaaaa);
    this.scene.add(ambientLight);
  }

  onRender = (delta) => {

    // Rotate the object...
    if (this.threeModel) {
      this.threeModel.rotation.x += 2 * delta;
      this.threeModel.rotation.y += 1.5 * delta;
    }

    // Render...
    this.renderer.render(this.scene, this.camera);
  }

  onAddObjectPress = () => {
    // Remove the current object...
    this.onRemoveObjectPress();

    // Add the current object...
    GooglePoly.getThreeModel(this.state.currentAsset, function(object) {
      this.threeModel = object;
      ExpoTHREE.utils.scaleLongestSideToSize(object, 0.75);
      object.position.z = -3;
      this.scene.add(object);
    }.bind(this), function(error) {
      console.log(error);
    });
  }

  onRemoveObjectPress = () => {
    if (this.threeModel) {
      this.scene.remove(this.threeModel);
    }
  }

  onCancelPress = () => {
    this.setState({searchModalVisible: false});
  }

  onAssetPress = (asset) => {
    this.setState({currentAsset: asset});
    this.setState({searchModalVisible: false});
  }

  onSearchModalPress = () => {
    this.setState({searchModalVisible: true});
  }

  render() {

    return (
      <View style={{flex:1}}>
        <ExpoGraphics.View style={{flex:1}}
          onContextCreate={this.onContextCreate}
          onRender={this.onRender}
          arEnabled={true}
        />

        <View style={{position:"absolute", bottom: 0, flex: 1, flexDirection: "row"}}>
          <View style={{flex: 1, flexDirection: "row", justifyContent: "space-between"}}>
            <Icon.Button size={40} name="plus" backgroundColor="transparent" onPress={this.onAddObjectPress} />
            <Icon.Button size={40} name="magnify" backgroundColor="transparent" onPress={this.onSearchModalPress} />
            <Icon.Button size={40} name="minus" backgroundColor="transparent" onPress={this.onRemoveObjectPress} />
          </View>
        </View>

        <Modal visible={this.state.searchModalVisible} animationType="slide">
          <SearchableGooglePolyAssetList 
            googlePoly={this.googlePoly} 
            onCancelPress={this.onCancelPress}
            onAssetPress={this.onAssetPress}
          />
        </Modal>

      </View>
    );
  }

}

const styles = StyleSheet.create({
  
});
