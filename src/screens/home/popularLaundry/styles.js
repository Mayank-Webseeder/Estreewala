import fonts from '../../../theme/appFonts';
import appColors from '../../../theme/appColors';
import { StyleSheet } from 'react-native';
import { fontSizes, windowHeight } from '../../../theme/appConstant';
import { SHOULD_AUTOBATCH } from '@reduxjs/toolkit';

export const styles = StyleSheet.create({
  container: {
    marginBottom: 24,
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 9,
    paddingHorizontal: 16,
  },
  title: {
    fontSize: fontSizes.FONT22,
    fontFamily: fonts.InterSemiBold,
    color: appColors.font
  },
  viewAllButton: {
    flexDirection: "row",
    alignItems: "center",
  },
  viewAllText: {
    fontSize: 12,
    color: appColors.blue,
    fontFamily: fonts.InterMedium,
    marginRight: 4,
  },
  listContainer: {
    paddingHorizontal: 16,
    paddingBottom: 1,
    paddingTop: 1
  },
  card: {
    backgroundColor: appColors.card,
    borderRadius: 16,
    marginRight: 16,
    width: 220,
    borderColor: "#07172cff",
    borderWidth: 1,
    overflow: 'hidden',
  },
  imageContainer: {
    position: 'relative',
    backgroundColor: appColors.lightCream,
    margin: 10,
    overflow: "hidden",
    borderRadius: 10,
    borderColor: "#07172cff",
    borderWidth: 1,
  },
  image: {
    width: "100%",
    height: 140,
    resizeMode: "contain",

  },
  cardContent: {
    paddingHorizontal: 13,
    paddingBottom: 12,
    paddingTop: 3
  },
  name: {
    fontSize: 16,
    fontFamily: fonts.InterMedium,
    color: appColors.font,
    marginBottom: 5,
  },
  locationContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 6,
  },
  location: {
    fontSize: 12,
    color: appColors.black,
    marginLeft: 6,
    paddingHorizontal:8,
    fontFamily: fonts.InterRegular,
    opacity: 0.7
  },
  timeContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 2,
  },
  time: {
    fontSize: 12,
    color: appColors.black,
    marginLeft: 6,
    fontFamily: fonts.InterRegular,
    opacity: 0.7
  },
  emptyText: {
    textAlign: "center",
    fontSize: fontSizes.FONT22,
    fontFamily: fonts.InterRegular,
    color: appColors.font,
    marginTop:windowHeight(10)
  }
});