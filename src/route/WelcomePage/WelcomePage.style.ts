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
  customImage: {
    height: 44,
    width: 44,
    padding: 0,
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
    paddingBlock: 8,
    paddingInline: 12,
    borderRadius: 16,
  },
  finishButton: {
    gap: 8,
  },
  prevButton: {
    marginTop: 8,
    flexDirection: 'row',
    paddingBlock: 6,
    paddingInline: 12,
    borderRadius: 16,
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
  providerSelectorMobile: {
    height: 44,
  },
  providerSelectorInput: {
    color: Colors.white,
  },
  providerValidateButton: {
    flexDirection: 'row',
    gap: 4,
    paddingBlock: 6,
    paddingInline: 12,
    borderRadius: 16,
  },
  providerValidateButtonDisabled: {
    opacity: 0.5,
  },
  cdnWrapper: {
    marginTop: 16,
    gap: 12,
  },
  cdnSlide: {
  },
  cdnSelector: {
    backgroundColor: Colors.lightBackground,
    padding: 12,
    borderRadius: 16,
    textTransform: 'capitalize',
  },
  cdnSelectorListScroll: {
    maxHeight: 160,
    overflow: 'hidden',
  },
  cdnSelectorList: {
    flexDirection: 'column',
    gap: 8,
  },
  cdnSelectorListItem: {
    backgroundColor: Colors.lightBackground,
    padding: 12,
    borderRadius: 16,
  },
  cdnSelectorListItemText: {
    fontSize: 14,
  },
  completeSlide: {
  },
  TVfocused: {
    backgroundColor: Colors.primary,
  },
  loginSlide: {
  },
  loginForm: {
    marginBlock: 16,
    flexDirection: 'column',
    gap: 12,
  },
});
