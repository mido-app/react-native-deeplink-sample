import React from 'react'
import { 
  StyleSheet, 
  Text,   
  View,
  Button,
  Platform
} from 'react-native'
import * as Permissions from 'expo-permissions'
import { Notifications } from "expo"
import { Notification } from 'expo/build/Notifications/Notifications.types'
import moment from 'moment'

export default class App extends React.Component {
  state = {
    isNotificationPermitted: false,
    isLocationPermitted: false,
  }
  
  render () {
    return (
      <View style={styles.container}>
        <View>
          <Text>Notification Permission: { this.state.isNotificationPermitted ? '○' : '×' }</Text>
          <Text>Location Permission: { this.state.isLocationPermitted ? '○' : '×' }</Text>
        </View>
        <View>
          <Button title="Send local notification" onPress={ this._sendLocalNotification } />
        </View>
      </View>
    )
  }

  async componentDidMount () {
    this.setState({
      isNotificationPermitted: await this._confirmNotificationPermission(),
      isLocationPermitted: await this._confirmLocationPermission()
    })

    Notifications.addListener(this._onReceiveNotification.bind(this))
  }

  async _confirmNotificationPermission () {
    const permission = await Permissions.getAsync(Permissions.NOTIFICATIONS)
    if (permission.status === 'granted') return true
    const askResult = await Permissions.askAsync(Permissions.NOTIFICATIONS)
    return askResult.status === 'granted'
  }

  async _confirmLocationPermission () {
    const permissionIsValid = (permission: Permissions.PermissionResponse) => {
      if (permission.status !== 'granted') return false
      if (Platform.OS !== 'ios') return true
      return permission.permissions.location.ios.scope === 'always'
    }
    const permission = await Permissions.getAsync(Permissions.LOCATION)
    if (permissionIsValid(permission)) return true
    const askResult = await Permissions.askAsync(Permissions.LOCATION)
    return permissionIsValid(askResult)
  }

  async _sendLocalNotification () {
    await Notifications.presentLocalNotificationAsync({
      title: 'テストローカル通知',
      body: 'これはテスト用のローカル通知です',
      data: {
        message: `[${moment().format('YYYY-MM-DD HH:mm:ss')}] テストローカル通知を受け取りました`
      },
      ios: {
        _displayInForeground: true
      }
    })
  }

  _onReceiveNotification (notification: Notification) {
    alert(notification.data.message)
  }
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
    alignItems: 'center',
    justifyContent: 'center',
  },
})
