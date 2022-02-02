import React, { useRef, useState, useEffect } from "react";
import { Marker } from "react-native-maps";
import MapView from "react-native-map-clustering";
import Icon from "react-native-vector-icons/Ionicons";

import {
  StyleSheet,
  Text,
  View,
  Dimensions,
  Image,
  Pressable,
  Modal,
} from "react-native";

import { getAllMarkers, putLocation } from "./api.js";

import * as Location from "expo-location";

export default function App() {
  const [lastLocation, setLastLocation] = useState({
    coords: { longitude: 0, latitude: 0 },
  });
  const [location, setLocation] = useState(null);
  const [showSuccess, setShowSuccess] = useState(false);
  const [errorMsg, setErrorMsg] = useState(null);
  const [region, setRegion] = useState({
    latitude: 40,
    longitude: 9,
    longitudeDelta: 5,
    latitudeDelta: 5,
  });

  const [marker, setMarker] = useState([]);

  useEffect(async () => {
    setMarker(await getAllMarkers());
  }, []);

  const mapRef = useRef();

  const animateToRegion = (animateRegion) => {
    mapRef.current.animateToRegion(animateRegion, 2000);
  };

  useEffect(() => {
    (async () => {
      let { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== "granted") {
        setErrorMsg("Permission to access location was denied");
        return;
      }

      let location = await Location.getCurrentPositionAsync({});
      setLocation(location);
      animateToRegion({
        latitude: location.coords.latitude,
        longitude: location.coords.longitude,
        latitudeDelta: 0.0922,
        longitudeDelta: 0.0421,
      });
    })();
  }, []);

  const sendLocation = async () => {
    if (
      location.coords.latitude != lastLocation.coords.latitude &&
      location.coords.longitude != lastLocation.coords.longitude
    ) {
      const json = {
        long: location.coords.longitude,
        lat: location.coords.latitude,
        message: "Hey I'm here",
        name: "Marcel",
      };
      const curMarkers = marker;
      putLocation(json).then((res) => {
        curMarkers.push(res);
        setMarker(curMarkers);
        setShowSuccess(true);
      });
      setLastLocation(location);
    }
  };

  return (
    <View style={styles.container}>
      <Pressable
        onPress={() => {
          sendLocation();
        }}
        style={styles.sendLocation}
      >
        <Text>Teile deinen Standort</Text>
      </Pressable>

      <Modal
        animationType="slide"
        transparent={true}
        visible={showSuccess}
        onRequestClose={() => {
          setShowSuccess(!showSuccess);
        }}
        style={{ alignItems: "center" }}
      >
        <View style={styles.successModal}>
          <Icon
            name="checkmark-circle"
            style={{ position: "absolute", top: 10 }}
            size={60}
            color={"green"}
          />
          <View style={styles.info}>
            <Text style={{ fontSize: 20 }}>
              Dein Standort wurde gespeichert!
            </Text>
          </View>
          <Pressable
            style={{
              backgroundColor: "lightblue",
              borderRadius: 10,
              height: 40,
              justifyContent: "center",
              alignItems: "center",
              width: "50%",
              position: "absolute",
              bottom: 10,
            }}
            onPress={() => setShowSuccess(!showSuccess)}
          >
            <Text style={styles.textStyle}>Ok!</Text>
          </Pressable>
        </View>
      </Modal>
      <MapView
        style={styles.map}
        ref={mapRef}
        initialRegion={region}
        followsUserLocation
        showsUserLocation
        clusterColor={"lightblue"}
        clusterTextColor={"white"}
      >
        {marker.length
          ? marker.map((marker, key) => {
              return (
                <Marker
                  title={marker.name}
                  description={marker.message}
                  coordinate={{
                    latitude: marker.lat,
                    longitude: marker.long,
                  }}
                  key={marker.id}
                  tracksViewChanges={false}
                  icon={require("./assets/marker.jpg")}
                />
              );
            })
          : null}
      </MapView>
    </View>
  );
}

const windowWidth = Dimensions.get("window").width;
const windowHeight = Dimensions.get("window").height;
const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#fff",
    alignItems: "center",
    justifyContent: "center",
    flexDirection: "column",
  },
  map: {
    flex: 1,
    width: "100%",
  },
  sendLocation: {
    position: "absolute",
    height: 50,
    width: "50%",
    backgroundColor: "lightblue",
    zIndex: 10,
    top: 50,
    alignItems: "center",
    justifyContent: "center",
    borderRadius: 20,
  },
  successModal: {
    backgroundColor: "white",
    width: "70%",
    height: 200,
    position: "absolute",
    left: windowWidth * 0.15,
    top: windowHeight / 2 - 100,
    borderRadius: 20,
    justifyContent: "center",
    alignItems: "center",
  },
});
