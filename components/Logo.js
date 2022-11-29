import { FaGithub } from "react-icons/fa";

const Logo = () => {

  return (
    <div className="logo flex gap-x-1">
        <FaGithub className="w-5" />
        <div className="text-sm font-semibold">clippit</div>
    </div>
  )
}

export default Logo