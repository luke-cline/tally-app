import React from "react"
import {
  ShoppingCart, Baby, Home, Zap, Shield, Repeat,
  Smile, Stethoscope, PiggyBank, TrendingUp, Wrench,
  Users, Megaphone, Landmark, MoreHorizontal
} from "lucide-react"

const iconMap = {
  Groceries: ShoppingCart,
  Kids: Baby,
  Housing: Home,
  Utilities: Zap,
  Insurance: Shield,
  Subscriptions: Repeat,
  Fun: Smile,
  Medical: Stethoscope,
  Savings: PiggyBank,
  Revenue: TrendingUp,
  "Software/Tools": Wrench,
  Contractors: Users,
  Marketing: Megaphone,
  Taxes: Landmark,
  Misc: MoreHorizontal,
}

export default function CategoryIcon({ name, size = 18 }) {
  const Icon = iconMap[name] || MoreHorizontal
  return <Icon size={size} />
}