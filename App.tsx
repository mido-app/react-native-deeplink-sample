import React, { useEffect } from 'react'
import { StyleSheet, View, Button } from 'react-native'
import { Notifications } from 'expo'
import * as Permissions from 'expo-permissions'
import * as Location from 'expo-location'
import * as TaskManager from 'expo-task-manager'

const GEOFENCING_TASK_NAME = 'GEOFENCING_TASK'

TaskManager.defineTask(GEOFENCING_TASK_NAME, ({ data: { eventType, region }, error }: any) => {
  if (error) {
    throw new Error(error.message)
  }

  let message
  if (eventType === Location.GeofencingEventType.Enter) {
    message = `あなたは${region.identifier}の近くにいます`
    Notifications.presentLocalNotificationAsync({
      title: '私は見ている',
      body: message,
      data: {
        title: '私は見ている',
        body: message,  
      },
      ios: {
        _displayInForeground: true
      }
    })
  } else if(eventType === Location.GeofencingEventType.Exit) {
    message = `あなたは${region.identifier}から離れています`
  }
  console.log(message)  
})

export default function App() {
  useEffect(() => {

    Permissions.getAsync(Permissions.LOCATION)
    .then(({ status, permissions }) => {
      if (status !== 'granted') throw new Error('You do not have permission for using location')
      console.log(permissions)
      if (permissions.location.ios.scope !== 'always') throw Error('You have to allow this app to always track device location')
      return Location.startGeofencingAsync(GEOFENCING_TASK_NAME, [
        {
          identifier: 'スカイツリー',
          latitude: 35.71005,
          longitude: 139.810609,
          radius: 300
        },
        {
          identifier: '東京タワー',
          latitude: 35.658581,
          longitude: 139.745433,
          radius: 300
        },
      ])
    })
    .then(() => console.log('geofencing started'))
    .catch(err => alert(err.message))

    Notifications.addListener(notification => {     
      console.log(notification)
      alert(`私は見ている： ${notification.data.body}`)
    })
  }, [])

  const checkPermission = async function (permission: Permissions.PermissionType) {
    try {
      const { status, permissions } = await Permissions.getAsync(permission)
      if (status === 'granted') {
        alert(`You have permission for using ${permission}.`)
      } else {
        alert(`You do not have permission for using ${permission}.`)
      }
      console.log(permissions)
    } catch (err) {
      console.error(err)
    }
  }

  const getPermission = async function (permission: Permissions.PermissionType) {
    try {
      const { status, permissions } = await Permissions.askAsync(permission)
      if (status === 'granted') {
        alert(`You got permission for using ${permission}`)
      } else {
        alert(`You could not get permission for using ${permission}.`)
      }
      console.log(permissions)
    } catch (err) {
      console.error(err)
    }
  }

  const testSendingNotification = async function () {
    try {
      const notificationId = await Notifications.presentLocalNotificationAsync({
        title: 'テストローカル通知',
        body: 'ローカル通知の送信テストです',
        data: {
          title: 'テストローカル通知',
          body: 'ローカル通知の送信テストです',
        },
        ios: {
          sound: true,
          _displayInForeground: true,
        }
      })
      console.log(notificationId)
    } catch (err) {
      console.error(err)
    }
  }

  const testSendingScheduledNotification = async function () {
    try {
      const notificationId = await Notifications.scheduleLocalNotificationAsync({
        title: 'テストローカル通知',
        body: 'ローカル通知の送信テストです',
        data: {
          title: 'テストローカル通知',
          body: 'ローカル通知の送信テストです',
        },
        ios: {
          sound: true,
          _displayInForeground: true,
        }        
      }, {
        time: new Date().getTime() + 5000 // 5 seconds later
      })
      console.log(notificationId)
    } catch (err) {
      console.error(err)
    }
  }

  return (
    <View style={styles.container}>
      <Button title="Check location permission" onPress={ () => checkPermission(Permissions.LOCATION) } />
      <Button title="Get location permission" onPress={ () => getPermission(Permissions.LOCATION) } />
      <Button title="Check notification permission" onPress={ () => checkPermission(Permissions.NOTIFICATIONS) } />
      <Button title="Get notification permission" onPress={ () => getPermission(Permissions.NOTIFICATIONS) } />
      <Button title="Check user facing notification permission" onPress={ () => checkPermission(Permissions.USER_FACING_NOTIFICATIONS) } />
      <Button title="Get user facing notification permission" onPress={ () => getPermission(Permissions.USER_FACING_NOTIFICATIONS) } />
      <Button title="Test sending notification just now" onPress={ () => testSendingNotification() } />
      <Button title="Test sending notification 5 seconds later" onPress={ () => testSendingScheduledNotification() } />
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
