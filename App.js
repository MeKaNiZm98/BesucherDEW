import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  Button,
  Image,
  Modal,
  TouchableHighlight,
  ScrollView,
} from "react-native";
import * as SQLite from "expo-sqlite";
import { LinearGradient } from "expo-linear-gradient";
import * as FileSystem from "expo-file-system";
import * as Sharing from "expo-sharing";
import * as ScreenOrientation from "expo-screen-orientation";
import { readDirectoryAsync } from "expo-file-system";

export default function App() {
  const db = SQLite.openDatabase("besucherdew3.db");

  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [location, setLocation] = useState("");
  const [email, setEmail] = useState("");
  const [visitors, setVisitors] = useState([]);
  const [durationHours, setDurationHours] = useState("");
  const [durationMinutes, setDurationMinutes] = useState("");
  const [sonstiges, setSonstiges] = useState("");

  const [visible, setVisible] = useState(false);
  const [modalVisible, setModalVisible] = useState(false);

  async function changeScreenOrientation() {
    await ScreenOrientation.lockAsync(
      ScreenOrientation.OrientationLock.LANDSCAPE_LEFT
    );
  }

  useEffect(() => {
    changeScreenOrientation();
    createTable();
    updateVisitors();
  }, []);

  const createTable = () => {
    db.transaction((tx) => {
      tx.executeSql(
        "create table if not exists visitors (id integer primary key not null, first_name text, last_name text, location text, email text, date_time text, durationHours text, durationMinutes text, sonstiges text);"
      );
    });
  };

  const saveVisitor = () => {
    const dateTime = new Date().toLocaleString("de-DE", {
      timeZone: "Europe/Berlin",
    });
    db.transaction(
      (tx) => {
        tx.executeSql(
          "insert into visitors (first_name, last_name, location, email, date_time, durationHours, durationMinutes, sonstiges) values (?, ?, ?, ?, ?, ?, ?, ?)",
          [
            firstName,
            lastName,
            location,
            email,
            dateTime,
            durationHours,
            durationMinutes,
            sonstiges,
          ]
        );
      },
      null,
      updateVisitors
    );
    setVisible(true);
    setTimeout(() => {
      setVisible(false);
    }, 10000);
    clearInputs();
  };

  const updateVisitors = () => {
    db.transaction((tx) => {
      tx.executeSql("select * from visitors", [], (_, { rows }) =>
        setVisitors(rows._array)
      );
    });
  };

  const exportVisitors = async () => {
    const csv = visitors
      .map(
        (visitor) =>
          `${visitor.first_name},${visitor.last_name},${visitor.location},${visitor.email},${visitor.date_time},${visitor.durationHours},${visitor.durationMinutes},${visitor.sonstiges}`
      )
      .join("\n");
    await FileSystem.writeAsStringAsync(
      FileSystem.documentDirectory + "Besucher_DEW.csv",
      csv
    );
    const fileUri = FileSystem.documentDirectory + "Besucher_DEW.csv";
    const contentUri = await FileSystem.getContentUriAsync(fileUri);
    await Sharing.shareAsync(fileUri);
  };

  const clearInputs = () => {
    setFirstName("");
    setLastName("");
    setDurationHours("");
    setDurationMinutes("");
    setLocation("");
    setEmail("");
    setSonstiges("");
  };

  const showModal = () => {
    setModalVisible(true);
  };

  const hideModal = () => {
    setModalVisible(false);
  };

  const resetDatabase = () => {
    db.transaction(
      (tx) => {
        tx.executeSql("delete from visitors");
      },
      null,
      updateVisitors
    );
    hideModal();
  };

  return (
    <LinearGradient colors={["#88cbd2", "#059aa3"]} style={{ flex: 1 }}>
      <View
        style={{
          flexDirection: "row",
          padding: "10%",
        }}
      >
        <View style={styles.container}>
          <Text style={styles.text}>
            Hi! Mein Name ist Pepper!{"\n"}Um Fördergelder zu bekommen, würden
            wir uns freuen, wenn Sie sich bei ihrem Besuch eintragen. {"\n"}Alle
            Daten sind natürlich optional. {"\n"}Vielen Dank!
          </Text>
          <Image
            style={{ width: "100%", height: "100%" }}
            resizeMode="contain"
            source={require("./assets/full-pepper.png")}
          ></Image>
          <View style={styles.exportieren}>
            <View style={{ flexDirection: "row" }}>
              <Modal
                animationType="slide"
                transparent={true}
                visible={modalVisible}
                onRequestClose={() => {
                  Alert.alert("Okay.");
                }}
              >
                <View style={styles.centeredView}>
                  <View style={styles.modalView}>
                    <Text style={styles.modalText}>
                      Sicher, das du die Datenbank löschen möchtest?
                    </Text>

                    <View style={styles.buttonGroup}>
                      <TouchableHighlight
                        style={styles.cancelButton}
                        onPress={hideModal}
                      >
                        <Text style={styles.cancelButtonText}>Abbrechen</Text>
                      </TouchableHighlight>
                      <TouchableHighlight
                        style={styles.deleteButton}
                        onPress={resetDatabase}
                      >
                        <Text style={styles.deleteButtonText}>Löschen</Text>
                      </TouchableHighlight>
                    </View>
                  </View>
                </View>
              </Modal>
              <Button title="🚮 Datenbank löschen" onPress={showModal} />
              <View style={{ paddingHorizontal: 100 }}></View>

              <Button title="⚙️  Exportieren" onPress={exportVisitors} />
            </View>
          </View>
        </View>

        <View style={styles.container}>
          <Image
            style={{
              width: "55%",
              height: "55%",
              marginTop: "-30%",
              marginBottom: "-15%",
            }}
            resizeMode="contain"
            source={require("./assets/digitale_erlebniswelt_wildeshausen.png")}
          ></Image>
          <ScrollView>
            <TextInput
              style={styles.input}
              placeholder="Vorname"
              onChangeText={(text) => setFirstName(text)}
              value={firstName}
            />
            <TextInput
              style={styles.input}
              placeholder="Nachname"
              onChangeText={(text) => setLastName(text)}
              value={lastName}
            />
            <View style={{ flexDirection: "row" }}>
              <TextInput
                style={styles.inputsmall}
                placeholder="Stunden"
                onChangeText={(text) => setDurationHours(text)}
                value={durationHours}
              />
              <TextInput
                style={styles.inputsmall}
                placeholder="Minuten"
                onChangeText={(text) => setDurationMinutes(text)}
                value={durationMinutes}
              />
            </View>
            <TextInput
              style={styles.input}
              placeholder="Ort"
              onChangeText={(text) => setLocation(text)}
              value={location}
            />
            <TextInput
              style={styles.input}
              placeholder="Email"
              onChangeText={(text) => setEmail(text)}
              value={email}
            />
            <TextInput
              style={styles.input}
              placeholder="Sonstiges"
              onChangeText={(text) => setSonstiges(text)}
              value={sonstiges}
            />
            <View style={styles.speichern}>
              <Button title="💾   Eingabe speichern" onPress={saveVisitor} />
              {visible && (
                <Text>Daten wurden gespeichert. Pepper bedankt sich!</Text>
              )}
            </View>
            <Text style={{ marginTop: 28, color: "white" }}>
              {" "}
              Version 1.4.0
            </Text>
          </ScrollView>
        </View>
      </View>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    shadowColor: "black",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.8,
    shadowRadius: 2,
    elevation: 1,
  },
  text: {
    borderWidth: 1,
    fontSize: 18,
    color: "#333",
    backgroundColor: "white",
    borderColor: "#ddd",
    borderRadius: 4,
    padding: 8,
    marginBottom: 20,
    minWidth: 250,
    marginTop: 25,
    marginHorizontal: 25,
  },
  input: {
    borderWidth: 1,
    fontSize: 18,
    color: "#333",
    backgroundColor: "white",
    borderColor: "#ddd",
    borderRadius: 4,
    padding: 8,
    minWidth: 300,
    marginTop: 25,
    marginHorizontal: 25,
  },
  inputsmall: {
    borderWidth: 1,
    fontSize: 18,
    color: "#333",
    backgroundColor: "white",
    borderColor: "#ddd",
    borderRadius: 4,
    padding: 8,
    minWidth: 150,
    maxWidth: 150,
    marginTop: 25,
    marginHorizontal: 25,
  },
  speichern: {
    marginTop: 25,
    backgroundColor: "white",
    borderRadius: 4,
    padding: 8,
  },
  exportieren: {
    alignItems: "center",
    position: "absolute",
    bottom: 0,
    left: 0,
    backgroundColor: "white",
    borderRadius: 4,
    padding: 8,
  },
  centeredView: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    marginTop: 22,
  },
  modalView: {
    margin: 20,
    backgroundColor: "white",
    borderRadius: 20,
    padding: 35,
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
  modalText: {
    fontSize: 18,
    color: "red",
    marginBottom: 15,
    textAlign: "center",
  },
  buttonGroup: {
    flexDirection: "row",
    width: "100%",
    justifyContent: "space-between",
  },
  cancelButton: {
    backgroundColor: "#DDDDDD",
    padding: 10,
    marginLeft: 100,
    borderRadius: 5,
    width: "40%",
  },
  deleteButton: {
    backgroundColor: "#FF345F",
    padding: 10,
    borderRadius: 5,
    width: "40%",
  },
  cancelButtonText: {
    color: "black",
    textAlign: "center",
  },
  deleteButtonText: {
    color: "white",
    textAlign: "center",
  },
});
