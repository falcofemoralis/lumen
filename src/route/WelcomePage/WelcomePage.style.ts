import { Dimensions } from 'react-native';
import Colors from 'Style/Colors';
import CreateStyles from 'Util/CreateStyles';

const { height } = Dimensions.get('window');

export const styles = CreateStyles({
  container: {
    paddingTop: 10,
    flex: 1,
    flexDirection: 'column',
    justifyContent: 'space-around',
    alignItems: 'center',
    maxHeight: height * 0.85,
    backgroundColor: Colors.background,
  },
  info: {
    flexDirection: 'column',
    gap: 8,
    width: '90%',
  },
  infoLandscape: {
    width: '70%',
  },
  iconContainer: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  icon: {
    backgroundColor: Colors.darkGray,
    borderRadius: 99,
    padding: 12,
  },
  title: {
    fontSize: 24,
    fontWeight: '700',
    textAlign: 'center',
  },
  subtitle: {
    fontSize: 16,
    color: Colors.lightGray,
    textAlign: 'center',
  },
  navigation: {
    flexDirection: 'column',
    justifyContent: 'center',
    alignContent: 'center',
    marginTop: 16,
    gap: 8,
  },
  buttonContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
  },
  buttonText: {
    fontSize: 16,
  },
  nextButton: {
    flexDirection: 'row',
    backgroundColor: Colors.gray,
    padding: 8,
    borderRadius: 16,
  },
  prevButton: {
  },
  welcomeSlide: {
  },
  configureSlide: {
  },
  configureWrapper: {
    marginTop: 16,
    gap: 12,
  },
  configureButton: {
    backgroundColor: Colors.lightBackground,
    padding: 12,
    borderRadius: 16,
  },
  configureContainer: {
    flexDirection: 'row',
    gap: 12,
  },
  configureIcon: {
  },
  configureInfo: {
  },
  configureTitle: {
    fontSize: 16,
    fontWeight: '700',
  },
  configureSubtitle: {
  },
  configureSelected: {
    backgroundColor: Colors.primary,
  },
  providerSlide: {
  },
  providerWrapper: {
    marginTop: 16,
    gap: 12,
  },
  providerButtonContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
  },
  providerButtonText: {
    fontSize: 16,
  },
  providerSelector: {
    backgroundColor: Colors.lightBackground,
    padding: 12,
    borderRadius: 16,
  },
  providerValidateButton: {
    flexDirection: 'row',
    backgroundColor: Colors.gray,
    padding: 8,
    borderRadius: 16,
  },
  providerValidateButtonDisabled: {
    backgroundColor: Colors.darkGray,
  },
  cdnSlide: {
  },
  cdnSelector: {
    backgroundColor: Colors.lightBackground,
    padding: 12,
    borderRadius: 16,
    textTransform: 'capitalize',
  },
  completeSlide: {
  },
  TVfocused: {
    backgroundColor: Colors.primary,
  },
});
