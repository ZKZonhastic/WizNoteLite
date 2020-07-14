import React from 'react';
import PropTypes from 'prop-types';
import classNames from 'classnames';
import { injectIntl } from 'react-intl';
import { withStyles, withTheme } from '@material-ui/core/styles';
import Dialog from '@material-ui/core/Dialog';
import DialogContent from '@material-ui/core/DialogContent';
import Button from '@material-ui/core/Button';
import IconButton from '@material-ui/core/IconButton';
import Backdrop from '@material-ui/core/Backdrop';
import CircularProgress from '@material-ui/core/CircularProgress';
//
import LiteText from './LiteText';
import LiteSelect from './LiteSelect';
import NoteViewer from '../pages/NoteViewer';
import Icons from '../config/icons';

const styles = (theme) => ({
  root: {
    width: 768,
    boxSizing: 'border-box',
    display: 'flex',
    position: 'relative',
    padding: `32px !important`,
    backgroundColor: theme.custom.background.about,
  },
  paper: {
    maxWidth: 'unset',
  },
  close: {
    position: 'absolute',
    top: 0,
    right: 0,
    fontSize: 12,
    color: theme.custom.color.contentToolIcon,
    userSelect: 'none',
    '&:hover': {
      color: theme.custom.color.contentToolIconHover,
    },
    '& .MuiIconButton-root': {
      padding: 6,
      borderRadius: 0,
    },
  },
  previewBox: {
    flex: 1,
    height: 384,
    display: 'flex',
    flexDirection: 'column',
  },
  viewerBox: {
    position: 'relative',
    width: '100%',
    boxSizing: 'border-box',
    flex: 1,
  },
  backdrop: {
    position: 'absolute',
    zIndex: 0,
    backgroundColor: theme.custom.background.previewBackdrop,
    color: theme.custom.color.matchedText,
  },
  exportButton: {
    backgroundColor: theme.custom.background.dialogButtonBlack,
    color: theme.custom.color.dialogButtonBlack,
    borderRadius: 0,
    '&:hover': {
      backgroundColor: theme.custom.background.dialogButtonBlackHover,
    },
    '&.Mui-disabled': {
      color: theme.custom.color.dialogButtonBlack,
      opacity: 0.5,
    },
  },
  list: {
    width: 128,
    height: 'auto',
    display: 'flex',
    paddingLeft: theme.spacing(4),
    flexDirection: 'column',
  },
  selectList: {
    minWidth: 128,
  },
  grow: {
    flexGrow: 1,
  },
  title: {
    margin: theme.spacing(1, 0),
    fontSize: 14,
    color: theme.custom.color.dialogTextPrimary,
  },
  pc: {
    border: '1px solid #d8d8d8 !important',
  },
  mobilePlus: {
    border: 'solid 6px #333333',
    borderBottom: 0,
    borderRadius: '40px 40px 0 0',
    overflow: 'hidden',
    width: 'auto',
    margin: '0 76px',
  },
  mobile: {
    border: 'solid 6px #333333',
    borderBottom: 0,
    borderRadius: '40px 40px 0 0',
    overflow: 'hidden',
    width: 'auto',
    margin: '0 127px',
  },
  darkBorderColor: {
    borderColor: '#d8d8d8',
  },
  lightBorderColor: {
    borderColor: '#333333',
  },
});

class ExportDialog extends React.Component {
  handler = {
    handleExportPng: () => {
      const { kbGuid, noteGuid } = this.props;
      if (!noteGuid || this.state.loading) {
        return;
      }
      //
      window.onCaptureScreenProgress = (progress) => {
        console.log(progress);
        if (progress === 100) {
          this.setState({ loading: false });
        }
      };
      //
      const { widthValue, previewTheme } = this.state;
      let width = 375;
      if (widthValue === 'mobilePlus') {
        width = 450;
      } else if (widthValue === 'pc') {
        width = 600;
      }
      //
      const options = {
        progressCallback: 'onCaptureScreenProgress',
        theme: previewTheme,
        width,
      };
      //
      this.setState({ loading: true });
      //
      window.wizApi.userManager.captureScreen(kbGuid, noteGuid, options);
    },
    handleChangePreviewTheme: (item, value) => {
      this.setState({ previewTheme: value });
    },
    handleChangeWidth: (item, value) => {
      this.setState({ widthValue: value });
    },
  };

  constructor(props) {
    super(props);
    this.state = {
      loading: false,
      previewTheme: null,
      widthValue: 'pc',
    };
  }

  componentDidMount() {
    const { theme } = this.props;
    this.setState({ previewTheme: theme.palette.type });
  }

  componentWillUnmount() {
    window.onCaptureScreenProgress = null;
  }

  render() {
    const {
      loading, previewTheme, widthValue,
    } = this.state;
    const {
      classes, open, onClose,
      kbGuid, noteGuid, intl,
    } = this.props;

    const themeOptions = [
      { value: 'light', title: intl.formatMessage({ id: 'lightOption' }) },
      { value: 'dark', title: intl.formatMessage({ id: 'darkOption' }) },
    ];

    const widthOptions = [
      { value: 'pc', title: intl.formatMessage({ id: 'pcOption' }) },
      { value: 'mobilePlus', title: intl.formatMessage({ id: 'mobilePlusOption' }) },
      { value: 'mobile', title: intl.formatMessage({ id: 'mobileOption' }) },
    ];

    return (
      <Dialog
        open={open}
        onEscapeKeyDown={onClose}
        classes={{
          paper: classes.paper,
        }}
      >
        <DialogContent className={classes.root}>
          <div className={classes.previewBox}>
            <LiteText className={classes.title}>
              {intl.formatMessage({ id: 'exportPng' })}
            </LiteText>
            <div className={classNames(
              classes.viewerBox,
              widthValue === 'pc' && classes.pc,
              widthValue === 'mobilePlus' && classes.mobilePlus,
              widthValue === 'mobile' && classes.mobile,
              previewTheme === 'dark' && classes.darkBorderColor,
              previewTheme === 'light' && classes.lightBorderColor,
            )}
            >
              <NoteViewer
                kbGuid={kbGuid}
                noteGuid={noteGuid}
                darkMode={previewTheme === 'dark'}
                params={{
                  kbGuid,
                  noteGuid,
                  padding: 16,
                }}
              />
              <Backdrop
                className={classNames(
                  classes.backdrop,
                )}
                open={loading}
              >
                <CircularProgress color="inherit" />
              </Backdrop>
            </div>
          </div>
          <div className={classes.list}>
            <LiteText className={classes.title}>
              {intl.formatMessage({ id: 'themeTitle' })}
            </LiteText>
            <LiteSelect
              options={themeOptions}
              value={previewTheme}
              listClass={classes.selectList}
              onChange={this.handler.handleChangePreviewTheme}
            />
            <LiteText className={classes.title}>
              {intl.formatMessage({ id: 'widthTitle' })}
            </LiteText>
            <LiteSelect
              options={widthOptions}
              value={widthValue}
              listClass={classes.selectList}
              onChange={this.handler.handleChangeWidth}
            />
            <div className={classes.grow} />
            <Button
              disabled={loading}
              className={classes.exportButton}
              onClick={this.handler.handleExportPng}
            >
              { loading ? 'loading...' : 'export'}
            </Button>
          </div>
          <div className={classes.close}>
            <IconButton color="inherit" onClick={onClose}>
              <Icons.ClearIcon />
            </IconButton>
          </div>
        </DialogContent>
      </Dialog>
    );
  }
}

ExportDialog.propTypes = {
  classes: PropTypes.object.isRequired,
  theme: PropTypes.object.isRequired,
  intl: PropTypes.object.isRequired,
  open: PropTypes.bool,
  onClose: PropTypes.func.isRequired,
  kbGuid: PropTypes.string.isRequired,
  noteGuid: PropTypes.string,
};

ExportDialog.defaultProps = {
  open: false,
  noteGuid: null,
};

export default withTheme(withStyles(styles)(injectIntl(ExportDialog)));
