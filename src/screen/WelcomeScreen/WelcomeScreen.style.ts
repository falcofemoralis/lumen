import { Theme, ThemedStyles } from 'Theme/types';

export const componentStyles = ({ scale, colors, text }: Theme) => ({
  page: {
    flex: 1,
    width: '100%',
    height: '100%',
  },
  wrapper: {
    flex: 1,
  },
  container: {
    height: '100%',
    flexDirection: 'column',
    justifyContent: 'center',
    gap: scale(24),
  },
  containerLandscape: {
    alignSelf: 'center',
    width: '60%',
  },
  info: {
    flexDirection: 'column',
    alignItems: 'center',
    alignSelf: 'center',
    gap: scale(12),
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
    backgroundColor: colors.button,
    borderRadius: scale(99),
    height: scale(54),
    width: scale(54),
  },
  icon: {
  },
  customImage: {
    height: scale(54),
    width: scale(54),
    padding: 0,
    borderRadius: scale(99),
  },
  image: {
    height: scale(54),
    width: scale(54),
    padding: 0,
  },
  title: {
    fontSize: scale(text.xl.fontSize),
    fontWeight: '700',
    textAlign: 'center',
  },
  subtitle: {
    fontSize: scale(text.sm.fontSize),
    color: colors.textSecondary,
    textAlign: 'center',
  },
  navigation: {
    position: 'absolute',
    flexDirection: 'row',
    justifyContent: 'center',
    alignSelf: 'center',
    bottom: scale(24),
    left: '50%',
    right: 0,
    transform: [{ translateX: '-50%' }],
    width: '70%',
    gap: scale(16),
  },
  buttonText: {
    fontSize: scale(text.sm.fontSize),
    textAlign: 'center',
  },
  nextButton: {
    flex: 1,
  },
  nextButtonPressable: {
    borderRadius: scale(16),
  },
  nextButtonContent: {
    flex: 1,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    padding: scale(12),
    backgroundColor: colors.button,
  },
  nextButtonLandscape: {
    maxWidth: '50%',
  },
  prevButtonContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
  },
  prevButton: {
    borderRadius: scale(50),
  },
  prevButtonContent: {
    flex: 1,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    padding: scale(12),
  },
  configureWrapper: {
    alignSelf: 'center',
    marginTop: scale(16),
    gap: scale(12),
    width: '80%',
  },
  configureButton: {
  },
  configureButtonPressable: {
    borderRadius: scale(16),
    height: scale(86),
  },
  configureButtonContent: {
    flex: 1,
    flexDirection: 'row',
    justifyContent: 'flex-start',
    alignItems: 'center',
    padding: scale(12),
    backgroundColor: colors.button,
  },
  configureButtonSelected: {
    backgroundColor: colors.primary,
  },
  configureContainer: {
    flexDirection: 'row',
    gap: scale(12),
  },
  configureIcon: {
  },
  configureInfo: {
  },
  configureTitle: {
    fontSize: scale(text.sm.fontSize),
    fontWeight: '700',
  },
  configureSubtitle: {
  },
  providerWrapper: {
    alignSelf: 'center',
    marginTop: scale(16),
    gap: scale(12),
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
    fontSize: scale(text.sm.fontSize),
  },
  providerSelector: {
    backgroundColor: colors.input,
    borderRadius: scale(16),
  },
  providerSelectorInput: {
    color: colors.text,
    borderRadius: scale(16),
    paddingHorizontal: scale(8),
  },
  providerValidateButton: {
    height: 'auto',
    alignSelf: 'center',
    justifyContent: 'center',
    borderRadius: scale(16),
    overflow: 'hidden',
  },
  providerValidateButtonContent: {
    flex: 0,
  },
  providerValidateButtonInner: {
    flexDirection: 'row',
    gap: scale(6),
    justifyContent: 'center',
    alignItems: 'center',
    paddingBlock: scale(8),
    paddingInline: scale(16),
  },
  providerValidateButtonDisabled: {
    opacity: 0.5,
    pointerEvents: 'none',
  },
  providerOffModeRow: {
    width: '100%',
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  cdnWrapper: {
    alignSelf: 'center',
    marginTop: scale(16),
    gap: scale(12),
    width: '80%',
  },
  cdnSlide: {
  },
  cdnSelector: {
    borderRadius: scale(16),
    textTransform: 'capitalize',
  },
  cdnSelectorContent: {
    backgroundColor: colors.input,
    padding: scale(12),
  },
  cdnSelectorListScroll: {
    maxHeight: scale(160),
    overflow: 'hidden',
  },
  cdnSelectorList: {
    flexDirection: 'column',
    gap: scale(8),
  },
  cdnSelectorListItem: {
    borderRadius: scale(16),
  },
  cdnSelectorListItemContent: {
    backgroundColor: colors.input,
    padding: scale(12),
  },
  cdnSelectorListItemText: {
    fontSize: scale(text.xs.fontSize),
  },
  completeSlide: {
  },
  TVfocused: {
    backgroundColor: colors.buttonFocused,
  },
  TVfocusedText: {
    color: colors.textFocused,
  },
  loginSlide: {
  },
  loginWrapper: {
    alignSelf: 'center',
    flexDirection: 'column',
    gap: scale(12),
    width: '80%',
  },
  loginInputs: {
    width: '100%',
    gap: scale(12),
  },
  alert: {
    flexDirection: 'row',
    gap: scale(4),
  },
  valid: {
  },
  registrationContainer: {
    alignSelf: 'center',
    flexDirection: 'row',
    gap: scale(4),
  },
  signUpText: {
    color: colors.secondary,
    fontSize: scale(text.sm.fontSize),
    fontWeight: '700',
  },
  signUpTextFocused: {
    color: colors.textFocused,
    backgroundColor: colors.buttonFocused,
    borderRadius: scale(4),
  },
  registrationOverlay: {
    flexDirection: 'column',
    gap: scale(8),
    padding: scale(8),
  },
  registrationOverlayTV: {
    maxWidth: '50%',
    maxHeight: '80%',
  },
  registrationRow: {
    flexDirection: 'column',
  },
  registrationRowWrapper: {
    flexDirection: 'row',
    gap: scale(6),
  },
  registrationRowNumber: {
    fontSize: scale(16),
    borderRadius: scale(99),
    backgroundColor: colors.backgroundLighter,
    height: scale(24),
    width: scale(24),
    textAlign: 'center',
    fontWeight: '700',
  },
  registrationRowTitle: {
    width: '90%',
    justifyContent: 'flex-start',
    alignItems: 'flex-start',
    fontSize: scale(text.sm.fontSize),
  },
  registrationRowContent: {
    justifyContent: 'flex-start',
    alignItems: 'flex-start',
    marginStart: scale(30),
    marginTop: scale(4),
    gap: scale(4),
  },
  supportEmailButton: {
    height: scale(24),
  },
  supportEmailButtonText: {
    color: colors.secondary,
  },
  supportEmailButtonTextFocused: {
    color: colors.textFocused,
    backgroundColor: colors.buttonFocused,
    borderRadius: scale(4),
  },
  registrationHintContainer: {
    flexGrow: 1,
    width: '90%',
    flexDirection: 'row',
    gap: scale(8),
    alignItems: 'center',
  },
  registrationHint: {
    fontSize: scale(text.xs.fontSize),
    fontWeight: '700',
  },
  registrationConfirmButtonWrapper: {
    width: '100%',
  },
  registrationConfirmButton: {
    backgroundColor: colors.primary,
  },
  loginButton: {
    height: 'auto',
    alignSelf: 'center',
    justifyContent: 'center',
    borderRadius: scale(16),
    overflow: 'hidden',
  },
  loginButtonContent: {
    flex: 0,
  },
  loginButtonInner: {
    flexDirection: 'row',
    gap: scale(6),
    justifyContent: 'center',
    alignItems: 'center',
    paddingBlock: scale(8),
    paddingInline: scale(16),
  },
  loginButtonDisabled: {
    opacity: 0.5,
    pointerEvents: 'none',
  },
  loginButtonText: {
    fontSize: scale(text.sm.fontSize),
  },
} satisfies ThemedStyles);
