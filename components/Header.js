import { FaVideo } from "react-icons/fa"

const Header = ({ title, channelName}) => {
  return (
    <div className="rounded-2xl bg-slate-200 px-4 py-2">
      <div className="flex gap-x-4">
        <div className="flex justify-center align-center w-14 h-11 self-center bg-emerald-100 rounded-xl">
          <FaVideo className="w-6 fill-emerald-500" />
        </div>
        <div>
          <h1 className="text-xl font-bold">{channelName}</h1>
          <h2 className="text-sm font-medium">{title}</h2>
        </div>
      </div>
    </div>
  )
}

Header.defaultProps = {
  title: "",
  channelName: ""
}

export default Header