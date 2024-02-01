import {
  RiInformationLine,
  RiCheckLine,
  RiQuestionLine,
  RiSpam2Line,
} from "react-icons/ri"

import { FaRegBell } from "react-icons/fa"

type MessageType = "info" | "success" | "warning" | "error"

type Alarm = {
  type: MessageType
  message: string
}

const makeAlert = ({ alarm, index }: { alarm: Alarm; index: number }) => {
  const className = `alert alert-${alarm.type}`
  const icon: Record<MessageType, JSX.Element> = {
    info: <RiInformationLine />,
    success: <RiCheckLine />,
    warning: <RiQuestionLine />,
    error: <RiSpam2Line />,
  }

  return (
    <li key={index}>
      <div role="alert" className={className}>
        {icon[alarm.type]}
        <span>{alarm.message}</span>
      </div>
    </li>
  )
}

export default function Alerts() {
  // These are for example pruposes only, remove them once it gets properly
  // implemented, data should come from props, from the caller
  const thisShouldComeFromProps: Alarm[] = [
    {
      type: "info",
      message: "Backend up and running",
    },
    {
      type: "success",
      message: "File saved",
    },
    {
      type: "warning",
      message: "Missing translation for menu X",
    },
    {
      type: "error",
      message: "Port 1023 unaccessible",
    },
  ]

  const alarmList = thisShouldComeFromProps.map((alarm: Alarm, index: number) =>
    makeAlert({ alarm, index }),
  )

  return (
    <div className="dropdown dropdown-end">
      <div tabIndex={0} role="button" className="btn btn-ghost btn-circle">
        <div className="indicator">
          <FaRegBell className="h-5 w-5" />
          <span className="badge badge-xs badge-accent indicator-item">
            {thisShouldComeFromProps.length}
          </span>
        </div>
      </div>
      <ul className="mt-3 z-[1] p-2 shadow menu menu-sm dropdown-content bg-base-100 rounded-box w-96 gap-1 bg-slate-200">
        <li key="-1">Demo (Not implemented)</li>
        {alarmList}
        <hr className="border-1 border-slate-800 w-auto" />
        <li key="-2">
          <a href="/alerts" className="link link-hover">
            See all...
          </a>
        </li>
      </ul>
    </div>
  )
}
