/* USAGE
 * <SSMLEditor loadHTML={htmlToPreLoad} handleSSML={handler} handleHTML={handler} />
**/

import { Editor } from 'slate-react'
import Html from 'slate-html-serializer'

import React from 'react'
import { Button, Toolbar } from './components'

import swal from 'sweetalert2'

import './editor.css';

//////////// START RULES
const BLOCK_TAGS = {
  p: 'paragraph',
  span: 'inline',
}

// Add a dictionary of mark tags.
const MARK_TAGS = {
  emphasis: 'emphasis',
  cardinal: 'cardinal',
  ordinal: 'ordinal',
  characters: 'characters',
  substitute: 'substitute',
  pitch: 'pitch',
  volume: 'volume',
  rate: 'rate',
}

const rules = [
  {
    deserialize(el, next) {

      const cls = el.className ? el.className.toLowerCase() : '';

      if (!MARK_TAGS[cls]) {
        const type = BLOCK_TAGS[el.tagName.toLowerCase()]
        if (type) {
          if (type == "inline") {
            let attrs = {};
            for (let k of el.attributes) {
              attrs[k.name] = k.value;
            }
            return {
              object: 'inline',
              type: "break",
              data: {
                attrs: { ...attrs },
              },
              nodes: next(el.childNodes),
            }
          } else {
            return {
              object: 'block',
              type: type,
              data: {
                className: el.getAttribute('class'),
              },
              nodes: next(el.childNodes),
            }
          }
        }
      }
    },
    serialize(obj, children) {
      if (obj.object == 'block' || obj.object == 'inline') {
        switch (obj.type) {
          case 'break':
            const attrs = obj.data.get('attrs')
            return (
              <Break
                contentEditable={false}
                attrs={attrs}
              />
            )
          case 'paragraph':
            return <p className={obj.data.get('className')}>{children}</p>
        }
      }
    },
  },
  // Add a new rule that handles marks...
  {
    deserialize(el, next) {
      if (!el.className) {
        return;
      }

      const type = MARK_TAGS[el.className.toLowerCase()];
      if (type) {
        let attrs = {}
        for (let k of el.attributes) {
          attrs[k.name] = k.value;
        }

        return {
          data: {
            ...attrs,
          },
          object: 'mark',
          type: type,
          nodes: next(el.childNodes),
        }
      }
    },
    serialize(obj, children) {
      if (obj.object == 'mark') {
        const attrs = obj.data.get('attrs')
        switch (obj.type) {
          case 'emphasis':
            return <strong className="emphasis" name="emphasis" {...attrs}>{children}</strong>
          case 'cardinal':
            return <span {...attrs} name="cardinal" className="cardinal">{children}</span>
          case 'ordinal':
            return <span {...attrs} name="ordinal" className="ordinal">{children}</span>
          case 'characters':
            return <span {...attrs} name="characters" className="characters">{children}</span>
          case 'substitute':
            return <span {...attrs} name="substitute" className="substitute">{children}</span>
          case 'pitch':
            return <span {...attrs} name="pitch" className="pitch" style={{ background: "#78AFF5" }}>{children}</span>
          case 'volume':
            return <span {...attrs} name="volume" className="volume" style={{ borderBottom: "1px solid #787CF5" }}>{children}</span>
          case 'rate':
            return <span {...attrs} name="rate" className="rate" style={{ borderBottom: "1px solid #D779DC", paddingBottom: 2 }}>{children}</span>
        }
      }
    },
  },
]

const html = new Html({ rules });
/////// END RULES

function Break(props) {
  const style = props.selected ? {
    outline: '2px solid blue',
    background: "#EEE",
    marginLeft: 10,
    marginRight: 10,
  } : {
      background: "#EEE",
      marginLeft: 10,
      marginRight: 10,
    };
  return (
    <span className={'break'} {...props.attrs} {...props.attributes} style={style}>
      ⏲️ <sup>{props.attrs.time}s</sup>
    </span>
  )
}

const noop = e => e.preventDefault();

class SSMLEditor extends React.Component {
  constructor(props) {
    super(props);

    const initialValue = props.loadHTML || "<p></p>";

    this.state = {
      isSelected: false,
      value: html.deserialize(initialValue),
    }
  }

  schema = {
    inlines: {
      break: {
        isVoid: true,
      },
    },
  }

  render() {
    const isSelected = this.state.isSelected;
    return (
      <div id="SSMLEditor">
        <Toolbar>
          <Button style={{ background: "#f45c42" }} onMouseDown={async (e) => {
            const { value: time } = await swal({
              title: 'How long should the break be?',
              type: 'question',
              input: 'range',
              inputAttributes: {
                min: 1,
                max: 10,
                step: 1
              },
              inputValue: 1,
              allowOutsideClick: false,
            });

            this.onClickInsert(e, 'break', 'BREAK', { time, });
          }}>
            Break
          </Button>

          <Button
            style={{ background: "#F5EF78" }}
            onMouseDown={async (event) => {
              if (!isSelected) {
                swal({
                  type: 'error',
                  title: 'Oops...',
                  text: 'You must have text selected',
                });
                return;
              }
              const { value: emphasis } = await swal({
                title: 'How much Emphasis?',
                input: 'select',
                allowOutsideClick: false,
                inputOptions: {
                  'strong': 'Strong',
                  'moderate': 'Moderate',
                  'reduced': 'Reduced'
                },
                inputValue: "strong",
                inputValidator: (value) => {
                  return !value && 'You need to select an option'
                }
              })
              this.onClickMark(event, 'emphasis', { emphasis, })
            }
            }>
            Emphasis
          </Button>

          <Button
            style={{ background: "#B1F578" }}
            onMouseDown={(event) => {
              if (!isSelected) {
                swal({
                  type: 'error',
                  title: 'Oops...',
                  text: 'You must have text selected',
                });
                return;
              }
              this.onClickMark(event, 'cardinal', { cardinal: "true" })
            }
            }>
            Cardinal
          </Button>

          <Button
            style={{ background: "#78F5AF" }}
            onMouseDown={(event) => {
              if (!isSelected) {
                swal({
                  type: 'error',
                  title: 'Oops...',
                  text: 'You must have text selected',
                });
                return;
              }
              this.onClickMark(event, 'ordinal', { ordinal: "true" })
            }
            }>
            Ordinal
          </Button>

          <Button
            style={{ background: "#9eede0" }}
            onMouseDown={(event) => {
              if (!isSelected) {
                swal({
                  type: 'error',
                  title: 'Oops...',
                  text: 'You must have text selected',
                });
                return;
              }
              this.onClickMark(event, 'characters', { characters: "true" })
            }
            }>
            Spell
          </Button>

          <Button
            style={{ background: "#78EAF5" }}
            onMouseDown={async (event) => {
              if (!isSelected) {
                swal({
                  type: 'error',
                  title: 'Oops...',
                  text: 'You must have text selected',
                });
                return;
              }
              const { value: sub } = await swal({
                title: 'Enter what you would like to say instead',
                input: 'text',
                allowOutsideClick: false,
                inputValidator: (value) => {
                  return !value && 'You need to write something!'
                }
              });

              this.onClickMark(event, 'substitute', { sub, })
            }
            }>
            Substitute
          </Button>

          <Button
            style={{ background: "#78AFF5" }}
            onMouseDown={async (event) => {
              if (!isSelected) {
                swal({
                  type: 'error',
                  title: 'Oops...',
                  text: 'You must have text selected',
                });
                return;
              }
              const { value: pitch } = await swal({
                title: 'Select the pitch',
                input: 'select',
                inputOptions: {
                  'x-low': 'X-Low',
                  'low': 'Low',
                  'medium': 'Medium',
                  'high': 'High',
                  'x-high': 'X-High',
                  'default': 'default',
                },
                inputValue: 'medium',
                allowOutsideClick: false,
                inputValidator: (value) => {
                  return !value && 'You need to select an option'
                }
              })
              this.onClickMark(event, 'pitch', { pitch, })
            }
            }>
            Pitch
          </Button>

          <Button
            style={{ background: "#787CF5" }}
            onMouseDown={async (event) => {
              if (!isSelected) {
                swal({
                  type: 'error',
                  title: 'Oops...',
                  text: 'You must have text selected',
                });
                return;
              }
              const { value: volume } = await swal({
                title: 'Select the Volume',
                input: 'select',
                inputOptions: {
                  "silent": "Silent",
                  "x-soft": "X-Soft",
                  "soft": "Soft",
                  "medium": "Medium",
                  "loud": "Loud",
                  "x-loud": "X-Loud",
                },
                inputValue: 'medium',
                allowOutsideClick: false,
                inputValidator: (value) => {
                  return !value && 'You need to select an option'
                }
              })
              this.onClickMark(event, 'volume', { volume, })
            }
            }>
            Volume
          </Button>

          <Button
            style={{ background: "#D779DC" }}
            onMouseDown={async (event) => {
              if (!isSelected) {
                swal({
                  type: 'error',
                  title: 'Oops...',
                  text: 'You must have text selected',
                });
                return;
              }
              const { value: rate } = await swal({
                title: 'Select what the rate of speech should be in %',
                type: 'question',
                input: 'range',
                inputAttributes: {
                  min: 0,
                  max: 300,
                  step: 1
                },
                inputValue: 0
              });
              this.onClickMark(event, 'rate', { rate, })
            }
            }>
            Rate
          </Button>
        </Toolbar>
        <Editor
          placeholder="Give your words a voice..."
          value={this.state.value}
          schema={this.schema}
          onChange={this.onChange}
          renderNode={this.renderNode}
          renderMark={this.renderMark}
        />
      </div>
    )
  }

  /**
   * Render a Slate node.
   *
   * @param {Object} props
   * @return {Element}
   */

  renderNode = props => {
    const { attributes, children, node, isFocused } = props

    switch (node.type) {
      case 'paragraph': {
        return <p {...attributes}>{children}</p>
      }
      case 'break': {
        const code = node.data.get('code')
        const attrs = node.data.get('attrs')
        return (
          <Break
            {...props.attributes}
            selected={isFocused}
            contentEditable={false}
            onDrop={noop}
            attrs={attrs}
          ></Break>
        )
      }
    }
  }

  renderMark = props => {
    const { children, mark, attributes } = props
    const attrs = mark.data.get('attrs')
    switch (mark.type) {
      case 'emphasis':
        return <strong {...attrs} {...attributes} {...attributes} name="emphasis">{children}</strong>
      case 'cardinal':
        return <span {...attrs} className="cardinal" name="cardinal" {...attributes}>{children}</span>
      case 'ordinal':
        return <span {...attrs} className="ordinal" name="ordinal" {...attributes}>{children}</span>
      case 'characters':
        return <span {...attrs} className="characters" name="characters" {...attributes}>{children}</span>
      case 'substitute':
        return <span {...attrs} className="substitute" name="substitute" {...attributes}>{children}</span>
      case 'pitch':
        return <span {...attrs} className="pitch" name="pitch" style={{ background: "#78AFF5" }} {...attributes}>{children}</span>
      case 'volume':
        return <span {...attrs} className="volume" name="volume" style={{ borderBottom: "1px solid #787CF5" }} {...attributes}>{children}</span>
      case 'rate':
        return <span {...attrs} className="rate" name="rate" style={{ borderBottom: "1px solid #D779DC", paddingBottom: 2 }} {...attributes}>{children}</span>
    }
  }

  onChange = ({ value }) => {
    if (value.fragment.text.length > 0) {
      this.setState({
        isSelected: true,
      })
    }
    if (value.document != this.state.value.document) {
      const doc = value.toJSON();
      const nodes = doc.document.nodes;

      let ssml = "<speak>";
      for (let paragraph of nodes) {
        ssml += "<p>"
        for (let node of paragraph.nodes) {
          if (node.type === "break") {
            ssml += `<break time="${node.data.attrs.time}s"/>`;
            continue;
          }
          for (let section of node.leaves) {
            if (section.marks.length === 0) {
              ssml += section.text;
            } else {
              let opening = [];
              let closing = [];

              let prosody_attrs = [];

              for (let mark of section.marks) {
                switch (mark.type) {
                  case 'emphasis':
                    opening.push(`<emphasis level="${mark.data.attrs.emphasis}">`);
                    closing.push("</emphasis>");
                    break;
                  case 'cardinal':
                    opening.push(`<say-as interpret-as="cardinal">`);
                    closing.push("</say-as>");
                    break;
                  case 'ordinal':
                    opening.push(`<say-as interpret-as="ordinal">`);
                    closing.push("</say-as>");
                    break;
                  case 'characters':
                    opening.push(`<say-as interpret-as="characters">`);
                    closing.push("</say-as>");
                    break;
                  case 'substitute':
                    opening.push(`<sub alias="${mark.data.attrs.sub}">`);
                    closing.push("</sub>");
                    break;
                  case 'pitch':
                    prosody_attrs.push(`pitch="${mark.data.attrs.pitch}"`);
                    break;
                  case 'volume':
                    prosody_attrs.push(`volume="${mark.data.attrs.volume}"`);
                    break;
                  case 'rate':
                    prosody_attrs.push(`rate="${mark.data.attrs.rate}%"`);
                    break;
                }
              }
              if (prosody_attrs.length > 0) {
                ssml += `<prosody ${prosody_attrs.join(" ")}>`;
              }
              if (opening.length > 0) {
                ssml += opening.join("");
              }
              ssml += section.text;
              if (closing.length > 0) {
                ssml += closing.join("");
              }
              if (prosody_attrs.length > 0) {
                ssml += "</prosody>";
              }
            }
          }
        }
        ssml += "</p>"
      }
      ssml += "</speak>";

      if (this.props.handleSSML) {
        this.props.handleSSML(ssml);
      }
      if (this.props.handleHTML) {
        const string = html.serialize(value);
        this.props.handleHTML(string);
      }
    }
    this.setState({ value })
  }

  onClickMark = (event, type, attrs) => {
    event.preventDefault()
    const { value } = this.state
    const change = value.change().toggleMark({ type, data: { "attrs": attrs, } })
    this.onChange(change)
  }

  onClickInsert = (e, type, code, attrs) => {
    e.preventDefault()
    const { value } = this.state
    const change = value.change()

    change
      .insertInline({
        type: type,
        data: { code, attrs },
      })
      .moveToStartOfNextText()
      .focus()

    this.onChange(change)
  }
}

export default SSMLEditor
