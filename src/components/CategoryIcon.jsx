import React from "react"
import * as Icons from "lucide-react"

export const ICON_OPTIONS = [
  "ShoppingCart", "Baby", "Home", "Zap", "Shield", "Repeat", "Smile", "Stethoscope",
  "PiggyBank", "TrendingUp", "Wrench", "Users", "Megaphone", "Landmark", "MoreHorizontal",
  "Car", "Fuel", "Plane", "Bus", "Bike", "Train",
  "Utensils", "Coffee", "Pizza", "Wine", "IceCreamCone",
  "Heart", "HeartPulse", "Pill", "Dumbbell", "Activity",
  "GraduationCap", "BookOpen", "School", "Backpack",
  "Gift", "PartyPopper", "Cake", "Ticket", "Film", "Music", "Gamepad2",
  "Shirt", "ShoppingBag", "Scissors", "Sparkles",
  "Wifi", "Phone", "Smartphone", "Laptop", "Monitor", "Tv",
  "Wallet", "CreditCard", "Banknote", "Coins", "DollarSign", "Receipt",
  "Building", "Building2", "Warehouse", "Store", "Briefcase",
  "Hammer", "Paintbrush", "Lightbulb", "Droplet", "Flame", "Trees",
  "Dog", "Cat", "PawPrint",
  "Plane", "MapPin", "Luggage", "Palmtree",
  "Umbrella", "CloudRain", "Sun",
  "FileText", "Folder", "Archive", "Calculator",
  "Users2", "UserRound", "Handshake",
  "Server", "Cloud", "Database", "Code",
  "Camera", "Headphones", "Speaker",
  "Bed", "Sofa", "Lamp",
  "Baby", "ToyBrick"
].filter((v, i, arr) => arr.indexOf(v) === i) // dedupe

export default function CategoryIcon({ name, size = 18 }) {
  const Icon = Icons[name] || Icons.MoreHorizontal
  return <Icon size={size} />
}