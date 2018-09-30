import { Editor } from 'slate-react'
import { Value } from 'slate'

import React from 'react'
import { Button, Toolbar } from './components'

import swal from 'sweetalert2'

import './editor.css';

function Break(props) {
  const style = props.selected ? {
    outline: '2px solid blue',
    background: "#EEE",
    marginLeft: 10,
    marginEight: 10,
  } : {};
  
  return (
    <span {...props.attrs} {...props.attributes} style={style}>
      BREAK
    </span>
  )
}

const noop = e => e.preventDefault();

class SSMLEditor extends React.Component {
  state = {
    value: Value.fromJSON({
      document: {
        nodes: [
          {
            object: 'block',
            type: 'paragraph',
            nodes: [
              {
                object: 'text',
                leaves: [
                  {
                    text: 'A line of text in a paragraph.',
                  },
                ],
              },
            ],
          },
        ],
      },
    }),
  }

  schema = {
    inlines: {
      break: {
        isVoid: true,
      },
    },
  }

  render() {
    return (
      <div>
        <Toolbar>
          <Button style={{ background: "#f45c42" }} onMouseDown={ async (e) => {
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

            this.onClickInsert(e, 'break', 'BREAK', {time,});
          }}>
            Break
          </Button>
          
          <Button
            style={{ background: "#F5EF78" }}
            onMouseDown={ async (event) => {
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
              this.onClickMark(event, 'emphasis', {emphasis,})}
            }>
            Emphasis
          </Button>

          <Button
            style={{ background: "#B1F578" }}
            onMouseDown={(event) => {
              this.onClickMark(event, 'cardinal', { cardinal: "true" })
            }
            }>
            Cardinal
          </Button>

          <Button
            style={{ background: "#78F5AF" }}
            onMouseDown={(event) => {
              this.onClickMark(event, 'ordinal', {ordinal: "true"})
            }
            }>
            Ordinal
          </Button>

          <Button
            style={{ background: "#9eede0"}}
            onMouseDown={(event) => {
              this.onClickMark(event, 'characters', { characters: "true" })
            }
            }>
            Characters
          </Button>

          <Button
            style={{ background: "#78EAF5" }}
            onMouseDown={async (event) => {
              const { value: sub } = await swal({
                title: 'Enter what you would like to say instead',
                input: 'text',
                allowOutsideClick: false,
                inputValidator: (value) => {
                  return !value && 'You need to write something!'
                }
              });

              this.onClickMark(event, 'substitute', {sub,})
            }
            }>
            Substitute
          </Button>

          <Button
            style={{ background: "#78AFF5" }}
            onMouseDown={async (event) => {
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
              this.onClickMark(event, 'pitch', {pitch,})
            }
            }>
            Pitch
          </Button>

          <Button
            style={{ background: "#787CF5" }}
            onMouseDown={async (event) => {
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
              this.onClickMark(event, 'volume', {volume,})
            }
            }>
            Volume
          </Button>

          <Button
            style={{ background: "#D779DC" }}
            onMouseDown={async (event) => {
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
              this.onClickMark(event, 'rate', {rate,})
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
          >
            {code}
          </Break>
        )
      }
    }
  }

  renderMark = props => {
    const { children, mark, attributes } = props
    const attrs = mark.data.get('attrs')
    switch (mark.type) {
      case 'emphasis':
        return <strong {...attrs} {...attributes} {...attributes}>{children}</strong>
      case 'cardinal':
        return <span {...attrs} className="cardinal" {...attributes}>{children}</span>
      case 'ordinal':
        return <span {...attrs} className="ordinal" {...attributes}>{children}</span>
      case 'characters':
        return <span {...attrs} className="characters" {...attributes}>{children}</span>
      case 'substitute':
        return <span {...attrs} className="substitute" {...attributes}>{children}</span>
      case 'pitch':
        return <span {...attrs} style={{ background: "#78AFF5" }} {...attributes}>{children}</span>
      case 'volume':
        return <span {...attrs} style={{ borderBottom: "1px solid #787CF5" }} {...attributes}>{children}</span>
      case 'rate':
        return <span {...attrs} style={{ borderBottom: "1px solid #D779DC", paddingBottom: 2 }} {...attributes}>{children}</span>  
    }
  }

  onChange = ({ value }) => {
    if (value.document != this.state.value.document) {
      const doc = value.toJSON();
      console.log(doc);
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
                switch(mark.type) {
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
      console.log(ssml);
    }
    this.setState({ value })
  }

  onClickMark = (event, type, attrs) => {
    event.preventDefault()
    const { value } = this.state
    const change = value.change().toggleMark({type, data: {"attrs": attrs,}})
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

/**
 * Export.
 */

export default SSMLEditor
