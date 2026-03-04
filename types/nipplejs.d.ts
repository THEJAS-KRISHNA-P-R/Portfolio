declare module 'nipplejs' {
  export interface JoystickOutputData {
    angle?: { radian: number; degree: number }
    direction?: { x: string; y: string; angle: string }
    distance: number
    force: number
    position: { x: number; y: number }
    pressure: number
    vector: { x: number; y: number }
    identifier: number
  }

  export interface JoystickManagerOptions {
    zone?: HTMLElement
    color?: string
    size?: number
    threshold?: number
    fadeTime?: number
    multitouch?: boolean
    maxNumberOfNipples?: number
    dataOnly?: boolean
    position?: { top?: string; right?: string; bottom?: string; left?: string }
    mode?: 'dynamic' | 'static' | 'semi'
    restJoystick?: boolean
    restOpacity?: number
    lockX?: boolean
    lockY?: boolean
    catchDistance?: number
    shape?: 'circle' | 'square'
    dynamicPage?: boolean
  }

  export type EventData = JoystickOutputData
  export type JoystickEventTypes = 'start' | 'end' | 'move' | 'dir' | 'plain'

  export interface JoystickManager {
    on(type: JoystickEventTypes | string, handler: (evt: Event, data: EventData) => void): JoystickManager
    off(type: JoystickEventTypes | string, handler: (evt: Event, data: EventData) => void): JoystickManager
    destroy(): void
    ids: number[]
    id: number
    options: JoystickManagerOptions
  }

  export interface NippleJS {
    create(options: JoystickManagerOptions): JoystickManager
  }

  const nipplejs: NippleJS
  export default nipplejs
}
