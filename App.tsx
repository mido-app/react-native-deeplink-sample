import React from 'react'
import { 
  StyleSheet, 
  Text,   
  View,
  Platform
} from 'react-native'
import * as Permissions from 'expo-permissions'

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
      </View>
    )
  }

  async componentDidMount () {
    this.setState({
      isNotificationPermitted: await this._confirmNotificationPermission(),
      isLocationPermitted: await this._confirmLocationPermission()
    })
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
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
    alignItems: 'center',
    justifyContent: 'center',
  },
})
