import { Colors } from 'Style/Colors';
import CreateStyles from 'Util/CreateStyles';

export const styles = CreateStyles({
  container: {
    height: '100%',
    flexDirection: 'column',
    justifyContent: 'center',
    gap: 24,
  },
  containerLandscape: {
    alignSelf: 'center',
    width: '60%',
  },
  info: {
    flexDirection: 'column',
    alignItems: 'center',
    alignSelf: 'center',
    gap: 12,
    width: '80%',
  },
  infoLandscape: {
    width: '70%',
  },
  iconContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    alignSelf: 'center',
    backgroundColor: Colors.button,
    borderRadius: 99,
    height: 54,
    width: 54,
  },
  icon: {
  },
  customImage: {
    height: 54,
    width: 54,
    padding: 0,
    borderRadius: 99,
  },
  image: {
    height: 54,
    width: 54,
    padding: 0,
  },
  title: {
    fontSize: 24,
    fontWeight: '700',
    textAlign: 'center',
  },
  subtitle: {
    fontSize: 16,
    color: Colors.textSecondary,
    textAlign: 'center',
  },
  navigation: {
    position: 'absolute',
    flexDirection: 'row',
    justifyContent: 'center',
    alignSelf: 'center',
    bottom: 24,
    left: '50%',
    right: 0,
    transform: [{ translateX: '-50%' }],
    width: '70%',
    gap: 16,
  },
  buttonText: {
    fontSize: 16,
    textAlign: 'center',
  },
  nextButton: {
    flex: 1,
  },
  nextButtonPressable: {
    borderRadius: 16,
  },
  nextButtonContent: {
    flex: 1,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 12,
    backgroundColor: Colors.button,
  },
  nextButtonLandscape: {
    maxWidth: '50%',
  },
  prevButtonContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
  },
  prevButton: {
    borderRadius: 50,
  },
  prevButtonContent: {
    flex: 1,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 12,
  },
  configureWrapper: {
    alignSelf: 'center',
    marginTop: 16,
    gap: 12,
    width: '80%',
  },
  configureButton: {
  },
  configureButtonPressable: {
    borderRadius: 16,
    height: 86,
  },
  configureButtonContent: {
    flex: 1,
    flexDirection: 'row',
    justifyContent: 'flex-start',
    alignItems: 'center',
    padding: 12,
    backgroundColor: Colors.button,
  },
  configureButtonSelected: {
    backgroundColor: Colors.primary,
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
  providerWrapper: {
    alignSelf: 'center',
    marginTop: 16,
    gap: 12,
    width: '80%',
  },
  providerButtonContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    alignSelf: 'center',
    width: '50%',
  },
  providerButtonText: {
    fontSize: 16,
  },
  providerSelector: {
    backgroundColor: Colors.input,
    borderRadius: 16,
  },
  providerSelectorInput: {
    color: Colors.white,
    borderRadius: 16,
    paddingHorizontal: 8,
  },
  providerValidateButton: {
    flexDirection: 'row',
    gap: 4,
    borderRadius: 16,
  },
  providerValidateButtonContent: {
    flexDirection: 'row',
    gap: 6,
    justifyContent: 'center',
    alignItems: 'center',
    paddingBlock: 8,
    paddingInline: 12,
  },
  providerValidateButtonDisabled: {
    opacity: 0.5,
    pointerEvents: 'none',
  },
  cdnWrapper: {
    alignSelf: 'center',
    marginTop: 16,
    gap: 12,
    width: '80%',
  },
  cdnSlide: {
  },
  cdnSelector: {
    borderRadius: 16,
    textTransform: 'capitalize',
  },
  cdnSelectorContent: {
    backgroundColor: Colors.input,
    padding: 12,
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
    borderRadius: 16,
  },
  cdnSelectorListItemContent: {
    backgroundColor: Colors.input,
    padding: 12,
  },
  cdnSelectorListItemText: {
    fontSize: 14,
  },
  completeSlide: {
  },
  TVfocused: {
    backgroundColor: Colors.buttonFocused,
  },
  TVfocusedText: {
    color: Colors.textFocused,
  },
  loginSlide: {
  },
  loginForm: {
    alignSelf: 'center',
    marginBlock: 16,
    flexDirection: 'column',
    gap: 12,
    width: '80%',
  },
  alert: {
    flexDirection: 'row',
    gap: 4,
  },
  valid: {

  },
});
