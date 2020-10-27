import PropTypes from 'prop-types';
import React, { Component } from 'react';
import { connect } from 'react-redux';
import { ReflexContainer, ReflexElement, ReflexSplitter } from 'react-reflex';
import { createSelector } from 'reselect';
import { getTargetEditor } from '../utils/getTargetEditor';
import { isDonationModalOpenSelector, userSelector } from '../../../redux';
import {
  canFocusEditorSelector,
  consoleOutputSelector,
  executeChallenge,
  inAccessibilityModeSelector,
  saveEditorContent,
  setAccessibilityMode,
  setEditorFocusability,
  visibleEditorsSelector,
  updateFile
} from '../redux';
import './editor.css';
import Editor from './Editor';

const propTypes = {
  canFocus: PropTypes.bool,
  // TODO: use shape
  challengeFiles: PropTypes.object,
  containerRef: PropTypes.any.isRequired,
  contents: PropTypes.string,
  description: PropTypes.string,
  dimensions: PropTypes.object,
  editorRef: PropTypes.any.isRequired,
  executeChallenge: PropTypes.func.isRequired,
  ext: PropTypes.string,
  fileKey: PropTypes.string,
  inAccessibilityMode: PropTypes.bool.isRequired,
  initialEditorContent: PropTypes.string,
  initialExt: PropTypes.string,
  output: PropTypes.arrayOf(PropTypes.string),
  resizeProps: PropTypes.shape({
    onStopResize: PropTypes.func,
    onResize: PropTypes.func
  }),
  saveEditorContent: PropTypes.func.isRequired,
  setAccessibilityMode: PropTypes.func.isRequired,
  setEditorFocusability: PropTypes.func,
  theme: PropTypes.string,
  updateFile: PropTypes.func.isRequired,
  visibleEditors: PropTypes.shape({
    indexjs: PropTypes.bool,
    indexjsx: PropTypes.bool,
    indexcss: PropTypes.bool,
    indexhtml: PropTypes.bool
  })
};

const mapStateToProps = createSelector(
  visibleEditorsSelector,
  canFocusEditorSelector,
  consoleOutputSelector,
  inAccessibilityModeSelector,
  isDonationModalOpenSelector,
  userSelector,
  (
    visibleEditors,
    canFocus,
    output,
    accessibilityMode,
    open,
    { theme = 'default' }
  ) => ({
    visibleEditors,
    canFocus: open ? false : canFocus,
    output,
    inAccessibilityMode: accessibilityMode,
    theme
  })
);

const mapDispatchToProps = {
  executeChallenge,
  saveEditorContent,
  setAccessibilityMode,
  setEditorFocusability,
  updateFile
};

class MultifileEditor extends Component {
  constructor(...props) {
    super(...props);

    // TENATIVE PLAN: create a typical order [html/jsx, css, js], put the
    // available files into that order.  i.e. if it's just one file it will
    // automatically be first, but  if there's jsx and js (for some reason) it
    //  will be [jsx, js].
    // this.state = {
    //   fileKey: 'indexhtml'
    // };

    // NOTE: This looks like it should be react state. However we need
    // to access monaco.editor to create the models and store the state and that
    // is only available in the react-monaco-editor component's lifecycle hooks
    // and not react's lifecyle hooks.
    // As a result it was unclear how to link up the editor's lifecycle with
    // react's lifecycle. Simply storing the models and state here and letting
    // the editor control them seems to be the best solution.

    // TODO: is there any point in initializing this? It should be fine with
    // this.data = {indexjs:{}, indexcss:{}, indexhtml:{}, indexjsx: {}}

    this.data = {
      indexjs: {
        model: null,
        state: null,
        viewZoneId: null,
        startEditDecId: null,
        endEditDecId: null,
        viewZoneHeight: null
      },
      indexcss: {
        model: null,
        state: null,
        viewZoneId: null,
        startEditDecId: null,
        endEditDecId: null,
        viewZoneHeight: null
      },
      indexhtml: {
        model: null,
        state: null,
        viewZoneId: null,
        startEditDecId: null,
        endEditDecId: null,
        viewZoneHeight: null
      },
      indexjsx: {
        model: null,
        state: null,
        viewZoneId: null,
        startEditDecId: null,
        endEditDecId: null,
        viewZoneHeight: null
      }
    };

    // TODO: we might want to store the current editor here
    this.focusOnEditor = this.focusOnEditor.bind(this);
  }

  focusOnHotkeys() {
    if (this.props.containerRef.current) {
      this.props.containerRef.current.focus();
    }
  }

  focusOnEditor() {
    // TODO: it should focus one of the editors
    // this._editor.focus();
  }

  componentWillUnmount() {
    // this.setState({ fileKey: null });
    this.data = null;
  }

  render() {
    const {
      challengeFiles,
      containerRef,
      description,
      editorRef,
      theme,
      resizeProps,
      visibleEditors
    } = this.props;
    const editorTheme = theme === 'night' ? 'vs-dark-custom' : 'vs-custom';
    // TODO: the tabs mess up the rendering (scroll doesn't work properly and
    // the in-editor description)

    // TODO: the splitters should appear between editors, so logically this
    // would be best as
    // editors.map(props => <EditorWrapper ...props>).join(<ReflexSplitter>)
    // ...probably! As long as we can put keys in the right places.
    const reflexProps = {
      propagateDimensions: true,
      renderOnResize: true,
      renderOnResizeRate: 20
    };

    // TODO: this approach (||ing the visibleEditors) isn't great.
    const splitCSS = visibleEditors.indexhtml && visibleEditors.indexcss;
    const splitJS =
      visibleEditors.indexcss ||
      (visibleEditors.indexhtml && visibleEditors.indexjs);

    // TODO: tabs should be dynamically created from the challengeFiles
    // TODO: the tabs mess up the rendering (scroll doesn't work properly and
    // the in-editor description)
    const targetEditor = getTargetEditor(challengeFiles);
    return (
      <ReflexContainer
        orientation='horizontal'
        {...reflexProps}
        {...resizeProps}
        className='editor-container'
      >
        <ReflexElement flex={10} {...reflexProps} {...resizeProps}>
          <ReflexContainer orientation='vertical'>
            {visibleEditors.indexhtml && (
              <ReflexElement {...reflexProps} {...resizeProps}>
                <Editor
                  challengeFiles={challengeFiles}
                  containerRef={containerRef}
                  description={
                    targetEditor === 'indexhtml' ? description : null
                  }
                  fileKey='indexhtml'
                  key='indexhtml'
                  ref={editorRef}
                  resizeProps={resizeProps}
                  theme={editorTheme}
                />
              </ReflexElement>
            )}
            {splitCSS && <ReflexSplitter propagate={true} {...resizeProps} />}
            {visibleEditors.indexcss && (
              <ReflexElement {...reflexProps} {...resizeProps}>
                <Editor
                  challengeFiles={challengeFiles}
                  containerRef={containerRef}
                  description={targetEditor === 'indexcss' ? description : null}
                  fileKey='indexcss'
                  key='indexcss'
                  resizeProps={resizeProps}
                  theme={editorTheme}
                />
              </ReflexElement>
            )}
            {splitJS && <ReflexSplitter propagate={true} {...resizeProps} />}

            {visibleEditors.indexjs && (
              <ReflexElement {...reflexProps} {...resizeProps}>
                <Editor
                  challengeFiles={challengeFiles}
                  containerRef={containerRef}
                  description={targetEditor === 'indexjs' ? description : null}
                  fileKey='indexjs'
                  key='indexjs'
                  resizeProps={resizeProps}
                  theme={editorTheme}
                />
              </ReflexElement>
            )}
            {visibleEditors.indexjsx && (
              <ReflexElement {...reflexProps} {...resizeProps}>
                <Editor
                  challengeFiles={challengeFiles}
                  containerRef={containerRef}
                  description={targetEditor === 'indexjsx' ? description : null}
                  fileKey='indexjsx'
                  key='indexjsx'
                  resizeProps={resizeProps}
                  theme={editorTheme}
                />
              </ReflexElement>
            )}
          </ReflexContainer>
        </ReflexElement>
      </ReflexContainer>
    );
  }
}

MultifileEditor.displayName = 'MultifileEditor';
MultifileEditor.propTypes = propTypes;

export default connect(
  mapStateToProps,
  mapDispatchToProps,
  null,
  { forwardRef: true }
)(MultifileEditor);
