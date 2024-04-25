import * as FileSystem from "expo-file-system";
import React, { useState, useEffect } from "react";
import { View, TextInput, Button, FlatList, Text, StyleSheet, Alert } from "react-native";

const App = () => {
  const [task, setTask] = useState("");
  const [description, setDescription] = useState("");
  const [tasks, setTasks] = useState([]);
  const [editMode, setEditMode] = useState(false);
  const [editTaskId, setEditTaskId] = useState(null);
  const filePath = FileSystem.documentDirectory + "tasks.json";

  useEffect(() => {
    const fetchTasks = async () => {
      try {
        const info = await FileSystem.getInfoAsync(filePath);
        if (info.exists) {
          const storedTasks = await FileSystem.readAsStringAsync(filePath);
          setTasks(JSON.parse(storedTasks));
        }
      } catch (error) {
        console.error("Error al recuperar tareas", error);
      }
    };
    fetchTasks();
  }, []);

  const addTask = async () => {
    try {
      const newTask = { id: Date.now(), task, description };
      const updatedTasks = [...tasks, newTask];
      await FileSystem.writeAsStringAsync(filePath, JSON.stringify(updatedTasks));
      setTasks(updatedTasks);
      setTask("");
      setDescription("");
    } catch (error) {
      console.error("Error al agregar tarea", error);
    }
  };

  const editTask = async () => {
    try {
      const updatedTasks = tasks.map((item) => {
        if (item.id === editTaskId) {
          return { ...item, task, description };
        }
        return item;
      });
      await FileSystem.writeAsStringAsync(filePath, JSON.stringify(updatedTasks));
      setTasks(updatedTasks);
      setEditMode(false);
      setTask("");
      setDescription("");
      setEditTaskId(null);
    } catch (error) {
      console.error("Error al editar tarea", error);
    }
  };

  const startEdit = (id, task, description) => {
    setEditMode(true);
    setEditTaskId(id);
    setTask(task);
    setDescription(description);
  };

  const cancelEdit = () => {
    setEditMode(false);
    setTask("");
    setDescription("");
    setEditTaskId(null);
  };

  const deleteTask = async (id) => {
    try {
      const updatedTasks = tasks.filter((item) => item.id !== id);
      await FileSystem.writeAsStringAsync(filePath, JSON.stringify(updatedTasks));
      setTasks(updatedTasks);
    } catch (error) {
      console.error("Error al borrar tarea", error);
    }
  };

  const confirmDelete = (id) => {
    Alert.alert(
      "Confirmar",
      "¿Estás seguro de que quieres borrar esta tarea?",
      [
        { text: "Cancelar", style: "cancel" },
        { text: "Borrar", onPress: () => deleteTask(id) },
      ],
      { cancelable: true }
    );
  };

  return (
    <View style={styles.container}>
      <TaskForm
        task={task}
        setTask={setTask}
        description={description}
        setDescription={setDescription}
        addTask={addTask}
        editMode={editMode}
        editTask={editTask}
        cancelEdit={cancelEdit}
      />
      <FlatList
        data={tasks}
        keyExtractor={(item, index) => index.toString()}
        renderItem={({ item }) => (
          <View style={styles.taskContainer}>
            <Text style={styles.taskText}>Tarea: {item.task}</Text>
            <Text style={styles.taskText}>Descripción: {item.description}</Text>
            <View style={styles.buttonContainer}>
              <Button
                title="Editar"
                style={styles.button}
                onPress={() => startEdit(item.id, item.task, item.description)}
              />
              <Button title="Borrar" onPress={() => confirmDelete(item.id)} />
            </View>
          </View>
        )}
      />
    </View>
  );
};

const TaskForm = ({
  task,
  setTask,
  description,
  setDescription,
  addTask,
  editMode,
  editTask,
  cancelEdit,
}) => {
  return (
    <View style={styles.formContainer}>
      <TextInput style={styles.input} placeholder="Tarea" value={task} onChangeText={setTask} />
      <TextInput
        style={styles.input}
        placeholder="Descripción"
        value={description}
        onChangeText={setDescription}
      />
      {editMode ? (
        <View style={styles.buttonContainer}>
          <Button title="Editar tarea" onPress={editTask} />
          <Button title="Cancelar" style={styles.button} onPress={cancelEdit} />
        </View>
      ) : (
        <Button title="Agregar" onPress={addTask} />
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 60,
  },
  formContainer: {
    width: "100%",
    marginBottom: 20,
  },
  input: {
    width: "100%",
    padding: 10,
    marginBottom: 10,
    borderWidth: 1,
    borderColor: "gray",
    borderRadius: 5,
  },
  button: {
    marginLeft: 10,
  },
  taskContainer: {
    marginBottom: 10,
    borderWidth: 1,
    borderColor: "lightgray",
    borderRadius: 5,
    padding: 10,
  },
  taskText: {
    fontSize: 16,
  },
  buttonContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
  },
});

export default App;
