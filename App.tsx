import React, { useState, useEffect } from 'react'
import { StyleSheet, Text, View, Button, FlatList, Platform } from 'react-native'
import { Notifications } from 'expo'
import * as Permissions from 'expo-permissions'
import * as Location from 'expo-location'
import * as TaskManager from 'expo-task-manager'
import moment from 'moment'

const GEOFENCING_TASK_NAME = 'GEOFENCING_TASK'

TaskManager.defineTask(GEOFENCING_TASK_NAME, ({ data: { eventType, region }, error }: any) => {
  if (error) {
    throw new Error(error.message)
  }

  let message
  if (eventType === Location.GeofencingEventType.Enter) {
    message = `あなたは${region.identifier}の近くにいます`
  } else if(eventType === Location.GeofencingEventType.Exit) {
    message = `あなたは${region.identifier}から離れています`
  }

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
  console.log(message)
})

export default function App() {
  const [ notificationHistory, setNotificationHistory ] = useState(new Array<string>())

  useEffect(() => {
    Permissions.getAsync(Permissions.LOCATION)
    .then(({ status, permissions }) => {
      if (status !== 'granted') throw new Error('You do not have permission for using location')
      console.log(permissions)

      // [only iOS]
      // App have to get 'always' permission to use backgrand location tracking
      if (Platform.OS === 'ios' && permissions.location.ios.scope !== 'always') {
        throw Error('You have to allow this app to always track device location')
      }

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
        {
          identifier: '晴海トリトンスクエア',
          latitude: 35.657413,
          longitude: 139.782514,
          radius: 300
        },
        {
          identifier: '東中野駅',
          latitude: 35.706229,
          longitude: 139.68381,
          radius: 300
        },
        {
          identifier: '新宿駅',
          latitude: 35.689607,
          longitude: 139.700571,
          radius: 300
        },
        {
          identifier: '大門駅',
          latitude: 35.656719,
          longitude: 139.755572,
          radius: 300
        },
        {
          identifier: '勝どき駅',
          latitude: 35.658979,
          longitude: 139.777149,
          radius: 300
        },      ])
    })
    .then(() => console.log('geofencing started'))
    .catch(err => alert(err.message))

    Notifications.addListener(notification => {
      const currentTimestamp = moment().format('YYYY-MM-DD HH:mm:ss')
      setNotificationHistory(prevHistory => [`[${currentTimestamp}] ${notification.data.body}`, ...prevHistory])
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
          // _displayInForeground: true,
        }
      })
      const currentTimestamp = moment().format('YYYY-MM-DD HH:mm:ss')
      setNotificationHistory([`[${currentTimestamp}] テスト通知を送信しました`, ...notificationHistory])
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
          // _displayInForeground: true,
        }
      }, {
        time: new Date().getTime() + 5000 // 5 seconds later
      })
      const currentTimestamp = moment().format('YYYY-MM-DD HH:mm:ss')
      setNotificationHistory([`[${currentTimestamp}] テスト通知を送信しました`, ...notificationHistory])
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
      <FlatList
        data={ notificationHistory }
        renderItem={ ({ item }) => (<View style={ styles.listItem }><Text>{ item }</Text></View>) }
        style={ { backgroundColor: '#ffffff' } }
        keyExtractor={ ( item, index ) => `${item}-${index}` }
      />
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
    alignItems: 'center',
    justifyContent: 'center',
    paddingTop: 16,
    paddingBottom: 16,
  },
  listItem: {
    backgroundColor: '#eeeeee',
    marginVertical: 4,
    padding: 2,
  }
})
