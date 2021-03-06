import React, { Component } from 'react';
import * as Actions from '../../store/actions';
import { bindActionCreators } from 'redux';
import connect from 'react-redux/es/connect/connect';
import { Calendar } from 'react-native-calendars';
import Moment from 'moment';
import { DashboardService, AuthService } from '@services';
import CalendarPicker from 'react-native-calendar-picker';
import { Images, Fonts, Constants } from '@commons';
import {
  StyleSheet,
  View,
  Keyboard,
  Platform,
  LayoutAnimation,
  TouchableOpacity,
  Alert,
} from 'react-native';
import UUIDGenerator from 'react-native-uuid-generator';
import { Item, Input, Label } from 'native-base';
import Orientation from 'react-native-orientation'
import Spinner from 'react-native-loading-spinner-overlay';
import { throwStatement } from '@babel/types';

class CreateEventScreen extends Component {
  static navigationOptions = ({ navigation }) => {
    return {
      title: 'Create Event',
      headerTitleStyle: {
        fontSize: 18,
        fontWeight: 'bold',
        alignSelf: 'center',
        textAlign: 'center',
        flex: 1,
      },
      headerRight: (
        <TouchableOpacity
          style={{
            marginRight: 20,
            flex: 1,
            alignSelf: 'center',
            justifyContent: 'center',
          }}
          onPress={navigation.getParam('save')}>
          <Label style={{ color: 'blue' }}>Save</Label>
        </TouchableOpacity>
      ),
      // headerLeft: (
      //   <TouchableOpacity
      //     style={{
      //       marginLeft: 15,
      //       flex: 1,
      //       alignSelf: 'center',
      //       justifyContent: 'center',
      //     }}
      //     onPress={() => navigation.goBack()}>
      //     <Label style={{color: 'blue'}}>Cancel</Label>
      //   </TouchableOpacity>
      // ),
    };
  };

  constructor(props) {
    super(props);
    this.state = {
      accountnum:
        props.login.account && props.login.account.account_num
          ? props.login.account.account_num
          : '',
      eventName: '',
      eventDate: '',
      uniqueid: '',
      selectedFlag: 0,
      checkedFlag: 0,
      loadingtxt: 'Creating Event...'
    };
    if (Constants.device_Pad) {
      Orientation.lockToLandscape();
    } else {
      Orientation.lockToPortrait();
    }
    this.CheckDate = this.CheckDate.bind(this);
    this.onDateChange = this.onDateChange.bind(this);
  }
  componentDidMount() {
    this.props.navigation.setParams({ save: this._save });
    UUIDGenerator.getRandomUUID(uuid => {
      this.setState({ uniqueid: uuid });
    });
  }
  _save = () => {
    const { eventName, eventDate, uniqueid, accountnum } = this.state;
    data = {
      accountnum: accountnum,
      uniqueid: uniqueid,
      eventdate: eventDate,
      eventname: eventName,
    }

    if (eventName === '') {
      Alert.alert('Please Enter Event Name');
    } else if (this.state.selectedFlag === 0) {
      Alert.alert('Please Select Event Date');
    } else if (this.state.checkedFlag === 0) {
      Alert.alert('Please Select Correct Event Date');
    }
    else {
      Constants.eventflag = 1;
      this.setState({ spinner: true })
      this.props.createevent(data);
    }
  };
  componentWillUnmount() {

  }
  componentDidUpdate(prevProps, prevState) {
    if (this.props.dashboard.status === 450 && Constants.eventflag == 1) {
      // this.props.navigation.navigate('dashboard');
      this.LoadEvent();
      Constants.eventflag = 0;
    }
    if (this.props.dashboard.status === 240 &&
      prevProps.dashboard.status === 100) {
      this.setState({ spinner: false })
      Constants.refreshdata = true;
      const { params } = this.props.navigation.state;
      params.callHome();
      setTimeout(() => { this.props.navigation.navigate('event'); }, 100)
    }
  }
  async LoadEvent() {
    let res = await AuthService.authlogin(Constants.user_mail, Constants.user_password);
    var account_num = res[0].account_num;
    this.props.getevent(account_num);
  }
  CheckDate(day) {
    var selectday = day.year + "-" + day.month + "-" + day.day;
    // alert(selectday);
    var now_date = new Date();
    var now_datestr = Moment(now_date).format('YYYY-MM-DD');
    // alert(now_datestr);
    var new_event = new Date(now_datestr);
    //alert(now_date.getFullYear());
    // alert(now_date.getMonth() + 1);
    var now_month = now_date.getMonth() + 1;
    var now_day = new Date().getDate();


    // alert(now_day);
    if (day.year > new_event.getFullYear()) {
      this.setState({ checkedFlag: 1, selectedFlag: 1, eventDate: selectday })
      alert('big');

    } else if (day.year === now_date.getFullYear()) {
      if (day.month > now_month) {
        // alert('big');
        this.setState({ checkedFlag: 1, selectedFlag: 1, eventDate: selectday })
      } else if (day.month === now_month) {
        if (day.day > now_day) {
          // alert('big');
          this.setState({ checkedFlag: 1, selectedFlag: 1, eventDate: selectday })
        } else if (day.day === now_day) {
          // alert('big');
          this.setState({ checkedFlag: 1, selectedFlag: 1, eventDate: selectday })
        } else {
          alert('You can not create event in the past');
          this.setState({ checkedFlag: 0, selectedFlag: 1, eventDate: '' })
        }
      } else {
        alert('You can not create event in the past');
        this.setState({ checkedFlag: 0, selectedFlag: 1, eventDate: '' })
      }


    } else {
      alert('You can not create event in the past');
      this.setState({ checkedFlag: 0, selectedFlag: 1, eventDate: '' })
    }

  }

  _onLayout = event => {
    if (Constants.device_Pad) {
      Orientation.lockToLandscape();
    } else {
      Orientation.lockToPortrait();
    }
  }
  onDateChange(date) {
    var selectday = Moment(date).format('YYYY-MM-DD');
    const oneday = 60 * 60 * 24 * 1000;
    if (date > new Date().valueOf() ){
      this.setState({ checkedFlag: 1, selectedFlag: 1, eventDate: selectday })
    }else if((new Date().valueOf() - date < oneday) ){
      this.setState({ checkedFlag: 1, selectedFlag: 1, eventDate: selectday })
    }
     else {
      alert('You can not create event in the past');
      // alert(new Date().valueOf() - date);
      this.setState({ checkedFlag: 0, selectedFlag: 1, eventDate: '' })
    }

  }
  render() {
    const minDate = new Date(2012, 1, 1);
    const maxDate = new Date(2999, 12, 30);
    return (
      <View style={{ flex: 1 }} onLayout={this._onLayout}>
        <Spinner
          visible={this.state.spinner}
          textContent={this.state.loadingtxt}
          textStyle={styles.spinnerTextStyle}
        />
        <View style={styles.container}>
          <View style={styles.txtrow}>
            <Item stackedLabel style={styles.txtviewitem}>
              <Label style={styles.txtlabel}>Event Name</Label>
              <Input
                value={this.state.eventName}
                style={styles.txtitem}
                onChangeText={text => this.setState({ eventName: text })}
              />
            </Item>
            <CalendarPicker
              style={{ width: '100%', flex: 1 }}
              todayBackgroundColor="#f2e6ee"
              minDate={minDate}
              maxDate={maxDate}
              onDateChange={this.onDateChange}
            />
          </View>
        </View>
      </View>
    );
  }
}

const styles = {
  container: {
    flex: 1,
  },
  txtinput: {
    height: 50,
    borderColor: '#CDCECD',
    borderRadius: 5,
    borderWidth: 0.2,
    backgroundColor: 'white',
    marginBottom: 10,
    marginLeft: 10,
    marginRight: 10,
    fontWeight: 'bold',
    paddingLeft: 10,
    fontSize: 18,
  },
  txtrow: {
    marginTop: 20,
  },
  txtbtn: {
    color: '#0520F1',
    fontWeight: 'bold',
    marginTop: 10,
    marginRight: 10,
  },
  txtbtnview: {
    width: '50%',
    flexDirection: 'row-reverse',
  },
  btn: {
    backgroundColor: '#38a2c2',
    height: 60,
    marginLeft: 10,
    marginRight: 10,
  },
  btntxt: {
    fontWeight: 'bold',
    color: 'white',
    fontSize: 16,
  },
  spinnerTextStyle: {
    color: '#FFF',
  },
  middle: {
    flex: 2,
    justifyContent: 'flex-start',
    alignSelf: 'stretch',
  },
  section: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  txtviewitem: {
    marginRight: 10,
    marginLeft: 10,
    padding: 0,
  },
  txtlabel: {
    fontSize: 12,
    fontWeight: 'bold',
    color: 'red',
  },
  txtitem: {},
  pickeritem: {
    height: 50,
  },
};

function mapDispatchToProps(dispatch) {
  return bindActionCreators(
    {
      createevent: Actions.createevent,
      getevent: Actions.getevent,
    },
    dispatch,
  );
}

function mapStateToProps({ login, dashboard }) {
  return {
    login: login,
    dashboard: dashboard,
  };
}

export default connect(
  mapStateToProps,
  mapDispatchToProps,
)(CreateEventScreen);
