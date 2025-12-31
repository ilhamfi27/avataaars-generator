import * as React from 'react'
import { AvatarStyle, Option, OptionContext } from 'avataaars'
import {
  Button,
  Col,
  FormLabel,
  Form,
  FormControl,
  FormGroup,
} from 'react-bootstrap'

interface SelectProps {
  controlId: string
  label: string
  value: string
  isLocked?: boolean
  onChange?: (value: string) => void
  onToggleLock?: () => void
}

// ref: https://stackoverflow.com/a/1714899/25077
const serializeQuery = function (obj: any) {
  const str = []
  for (const p in obj) {
    if (obj.hasOwnProperty(p)) {
      str.push(encodeURIComponent(p) + '=' + encodeURIComponent(obj[p]))
    }
  }
  return str.join('&')
}

class OptionSelect extends React.Component<SelectProps> {
  render() {
    const { controlId, label, value, children, isLocked, onToggleLock } =
      this.props
    return (
      <FormGroup className='row' controlId={controlId}>
        <Col as={FormLabel} sm={3}>
          {label}
        </Col>
        <Col sm={8}>
          <FormControl as='select' value={value} onChange={this.onChange}>
            {children}
          </FormControl>
        </Col>
        <Col sm={1} style={{ paddingTop: '7px', textAlign: 'center' }}>
          <i
            className={isLocked ? 'fa fa-lock' : 'fa fa-unlock'}
            onClick={onToggleLock}
            title={isLocked ? 'Unlock this option' : 'Lock this option'}
            style={{
              cursor: 'pointer',
              fontSize: '16px',
              color: isLocked ? '#6A39D7' : '#999',
            }}
          />
        </Col>
      </FormGroup>
    )
  }

  private onChange = (event: React.FormEvent<typeof FormControl>) => {
    if (this.props.onChange) {
      this.props.onChange((event.target as any as HTMLSelectElement).value)
    }
  }
}

export interface Props {
  avatarStyle: AvatarStyle
  optionContext: OptionContext
  displayingCode: boolean
  displayingImg: boolean
  lockedOptions?: Set<string>
  onDownloadPNG?: () => void
  onDownloadSVG?: () => void
  onAvatarStyleChange?: (avatarStyle: AvatarStyle) => void
  onToggleCode?: () => void
  onToggleImg?: () => void
  onToggleLock?: (optionKey: string) => void
}

interface State {
  lockedOptions: Set<string>
}

export default class AvatarForm extends React.Component<Props, State> {
  private onChangeCache: Array<(value: string) => void> = []
  private onToggleLockCache: Array<() => void> = []

  state: State = {
    lockedOptions: new Set<string>(),
  }

  UNSAFE_componentWillMount() {
    const { optionContext } = this.props
    optionContext.addStateChangeListener(() => {
      this.forceUpdate()
    })
    this.onChangeCache = optionContext.options.map((option) =>
      this.onChange.bind(this, option)
    )
    this.onToggleLockCache = optionContext.options.map((option) =>
      this.onToggleLock.bind(this, option.key)
    )
  }

  render() {
    const { optionContext, avatarStyle, displayingImg, displayingCode } =
      this.props
    const { lockedOptions } = this.state
    const selects = optionContext.options
      .map((option, index) => {
        const optionState = optionContext.getOptionState(option.key)!
        if (optionState.available <= 0) {
          return null
        }
        const selectOptions = optionState.options.map((type) => (
          <option key={type} value={type}>
            {type}
          </option>
        ))
        const value = optionContext.getValue(option.key)!
        const isLocked = lockedOptions.has(option.key)
        return (
          <OptionSelect
            key={option.key}
            controlId={option.key}
            label={option.label}
            value={value}
            isLocked={isLocked}
            onChange={this.onChangeCache[index]}
            onToggleLock={this.onToggleLockCache[index]}>
            {selectOptions}
          </OptionSelect>
        )
      })
      .filter((select) => select !== null)
    const labelCol = 3
    const inputCol = 9
    return (
      <Form>
        <FormGroup className='row' controlId='avatar-style'>
          <Col as={FormLabel} sm={3}>
            Avatar Style
          </Col>
          <Col sm={9}>
            <label>
              <input
                type='radio'
                id='avatar-style-circle'
                name='avatar-style'
                value={AvatarStyle.Circle}
                checked={avatarStyle === AvatarStyle.Circle}
                onChange={this.onAvatarStyleChange}
              />{' '}
              Circle
            </label>{' '}
            <label>
              <input
                type='radio'
                id='avatar-style-transparent'
                name='avatar-style'
                value={AvatarStyle.Transparent}
                checked={avatarStyle === AvatarStyle.Transparent}
                onChange={this.onAvatarStyleChange}
              />{' '}
              Transparent
            </label>
          </Col>
        </FormGroup>
        {selects}
        <FormGroup className='row'>
          <Col
            className={`offset-sm-${labelCol}`}
            sm={{ span: inputCol, offset: labelCol }}>
            More options coming soon,{' '}
            <a href='http://eepurl.com/c_7fN9' target='_blank'>
              subscribe for updates
            </a>
          </Col>
        </FormGroup>
        <FormGroup className='row'>
          <Col
            className={'offset-sm-' + labelCol}
            sm={{ span: inputCol, offset: labelCol }}>
            <Button
              variant='primary'
              type='submit'
              onClick={this.onDownloadPNG}>
              <i className='fa fa-download' /> PNG
            </Button>{' '}
            <Button
              variant='secondary'
              type='submit'
              onClick={this.onDownloadSVG}>
              <i className='fa fa-download' /> SVG
            </Button>{' '}
            <Button
              variant='secondary'
              type='submit'
              onClick={this.onToggleCode}>
              <i className='fa fa-code' />{' '}
              {displayingCode ? 'Hide React' : 'Show React'}
            </Button>{' '}
            <Button
              variant='secondary'
              type='submit'
              onClick={this.onToggleImg}>
              <i className='fa fa-code' />{' '}
              {displayingImg ? 'Hide <img>' : 'Show <img>'}
            </Button>
            <div style={{ marginTop: '10px' }}>
              <iframe
                src={
                  'https://platform.twitter.com/widgets/tweet_button.html?' +
                  serializeQuery({
                    text: 'I just created my avataaars here 😆',
                    url: document.location.href,
                    hashtags: 'avataaars,avatar',
                    size: 'l',
                    lang: 'en',
                  })
                }
                width='140'
                height='28'
                title='Twitter Tweet Button'
                style={{ border: 0, overflow: 'hidden' }}
              />
            </div>
          </Col>
        </FormGroup>
      </Form>
    )
  }

  private onChange(option: Option, value: string) {
    const { optionContext } = this.props
    const { lockedOptions } = this.state
    if (lockedOptions.has(option.key)) {
      return
    }
    optionContext.setValue(option.key, value)
  }

  private onAvatarStyleChange = (event: React.FormEvent<HTMLInputElement>) => {
    if (this.props.onAvatarStyleChange) {
      this.props.onAvatarStyleChange((event.target as any).value)
    }
  }

  private onDownloadPNG = (event: React.FormEvent<typeof FormControl>) => {
    event.preventDefault()
    if (this.props.onDownloadPNG) {
      this.props.onDownloadPNG()
    }
  }

  private onDownloadSVG = (event: React.FormEvent<typeof FormControl>) => {
    event.preventDefault()
    if (this.props.onDownloadSVG) {
      this.props.onDownloadSVG()
    }
  }

  private onToggleCode = (event: React.FormEvent<typeof FormControl>) => {
    event.preventDefault()
    if (this.props.onToggleCode) {
      this.props.onToggleCode()
    }
  }

  private onToggleImg = (event: React.FormEvent<typeof FormControl>) => {
    event.preventDefault()
    if (this.props.onToggleImg) {
      this.props.onToggleImg()
    }
  }

  private onToggleLock = (optionKey: string) => {
    this.setState((prevState) => {
      const newLockedOptions = new Set(prevState.lockedOptions)
      if (newLockedOptions.has(optionKey)) {
        newLockedOptions.delete(optionKey)
      } else {
        newLockedOptions.add(optionKey)
      }

      return { lockedOptions: newLockedOptions }
    })
  }

  public getLockedOptions = (): Set<string> => this.state.lockedOptions
}
