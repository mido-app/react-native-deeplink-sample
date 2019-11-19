import React from 'react'
import { StyleSheet, Text, View, Button } from 'react-native'
import * as Permissions from 'expo-permissions'

export default function App() {
  const checkPermission = async function () {
    const { status, permissions } = await Permissions.getAsync(Permissions.LOCATION)
    if (status === 'granted') {
      alert(`You have permission for using device location.`)
    } else {
      alert('You do not have permission for using device location.')
    }
    console.log(permissions)
  }

  const getPermission = async function () {
    const { status, permissions } = await Permissions.askAsync(Permissions.LOCATION)
    if (status === 'granted') {
      alert(`You got permission for using device location`)
    } else {
      alert(`You could not get permission for using device location.`)
    }
    console.log(permissions)
  }

  return (
    <View style={styles.container}>
      <Text>Open up App.tsx to start working on your app!</Text>
      <Button title="Check permission" onPress={ () => checkPermission() } />
      <Button title="Get permission" onPress={ () => getPermission() } />
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
    alignItems: 'center',
    justifyContent: 'center',
  },
})
