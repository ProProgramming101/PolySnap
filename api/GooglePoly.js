
import ExpoTHREE from 'expo-three';
import AssetUtils from 'expo-asset-utils';
import * as THREE from 'three';
require("./../util/OBJLoader");
require("./../util/MTLLoader");

export default class GooglePoly {

    constructor(apiKey) {
        this.apiKey = apiKey;
        this.currentResults = [];
        this.nextPageToken = "";
        this.keywords = "";
    }

    // Returns a query URL based on the given data...
    static getQueryURL(apiKey, keywords, nextPageToken) {
        var baseURL = "https://poly.googleapis.com/v1/assets?";

        var url = baseURL + "key=" + apiKey;
        url += "&pageSize=10";
        url += "&maxComplexity=MEDIUM";
        url += "&format=OBJ";
        if (keywords) { url += "&keywords=" + encodeURIComponent(keywords); }
        if (nextPageToken) { url += "&pageToken=" + nextPageToken; }
        return url;
    }

    // Sets current search parameters and resets member variables...
    setSearchParams = (keywords) => {
        this.currentResults = [];
        this.nextPageToken = "";
        this.keywords = keywords;
    }

    // Returns the results of the current query...
    getSearchResults() {
        var url = GooglePoly.getQueryURL(this.apiKey, this.keywords, this.nextPageToken);

        return fetch(url)
            .then(function(response) { return response.json(); })
            .then(function(data) {
                this.currentResults = this.currentResults.concat(data.assets);
                this.nextPageToken = data.nextPageToken;

                return Promise.resolve(data.assets);
            }.bind(this));
    }

    // Returns a Three.js object
    static getThreeModel(objectData, success, failure) {
        if (!success) { success = function() { }; }
        if (!failure) { failure = function() { }; }
        if (!objectData) { failure("objectData is null"); return; }

        // Search for a format...
        var format = objectData.formats.find(format => { return format.formatType == "OBJ"; });
        if (format === undefined) { failure("No format found"); return; }

        // Search for a resource...
        var obj = format.root;
        var mtl = format.resources.find(resource => { return resource.url.endsWith("mtl"); });
        var tex = format.resources.find(resource => { return resource.url.endsWith("png"); });
        var path = obj.url.slice(0, obj.url.indexOf(obj.relativePath));

        // Load the MTL...
        var loader = new THREE.MTLLoader();
        loader.setCrossOrigin(true);
        loader.setTexturePath(path);
        loader.load(mtl.url, function(materials) {

            // Load the OBJ...
            loader = new THREE.OBJLoader();
            loader.setMaterials(materials);
            loader.load(obj.url, async function(object) {

                // If there is a texture, apply it...
                if (tex !== undefined) {
                    var texUri = await AssetUtils.uriAsync(tex.url);
                    var texture = new THREE.MeshBasicMaterial({ map: await ExpoTHREE.loadAsync(texUri) });
                    object.traverse((child) => {
                        if (child instanceof THREE.Mesh) {
                            child.material = texture;
                        }
                    });
                }

                // Return the object...
                success(object);
            });
        });
    }
}