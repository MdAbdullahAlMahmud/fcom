"use client"

import { useState, useEffect } from "react"
import { Card } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Building2, Phone, Share2, Cog } from "lucide-react"
import ContentSettingsForm from "./content/ContentSettingsForm"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { useToast } from "@/components/ui/use-toast"
import { AlertCircle, DollarSign } from "lucide-react"

const TABS = [
	{
		id: "general",
		label: "General Settings",
		icon: <Cog className="w-4 h-4" />,
		description: "Basic store configuration and preferences",
	},
	{
		id: "content",
		label: "Site Information",
		icon: <Building2 className="w-4 h-4" />,
		description: "Manage your store details and branding",
	},
]

export default function SettingsPage() {
	const { toast } = useToast()
	const [activeTab, setActiveTab] = useState("general")
	const [isLoading, setIsLoading] = useState(false)
	const [formData, setFormData] = useState({
		siteName: "",
		contactEmail: "",
		contactPhone: "",
		deliveryFee: "",
		minOrderAmount: "",
	})

	// Load existing settings
	useEffect(() => {
		const loadSettings = async () => {
			try {
				const response = await fetch("/api/settings")
				const data = await response.json()
				if (response.ok) {
					setFormData(data)
				}
			} catch (error) {
				console.error("Failed to load settings:", error)
			}
		}
		loadSettings()
	}, [])

	const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
		const { name, value } = e.target
		setFormData((prev) => ({ ...prev, [name]: value }))
	}

	async function onSubmit(event: React.FormEvent<HTMLFormElement>) {
		event.preventDefault()
		setIsLoading(true)

		try {
			const response = await fetch("/api/settings", {
				method: "PUT",
				headers: { "Content-Type": "application/json" },
				body: JSON.stringify(formData),
			})

			const result = await response.json()

			if (!response.ok) {
				throw new Error(result.message || "Failed to update settings")
			}

			toast({
				title: "Settings Updated Successfully",
				description: "Your site settings have been saved.",
				duration: 3000,
			})
		} catch (error) {
			toast({
				variant: "destructive",
				title: "Error Saving Settings",
				description:
					error instanceof Error
						? error.message
						: "An error occurred while saving settings",
			})
		} finally {
			setIsLoading(false)
		}
	}

	return (
		<div className="container py-8 max-w-5xl mx-auto">
			<div className="flex items-center justify-between mb-8">
				<div>
					<h1 className="text-3xl font-bold text-slate-900">Settings</h1>
					<p className="mt-2 text-slate-500">
						Manage your store's configuration and preferences
					</p>
				</div>
			</div>

			<Card className="p-1">
				<Tabs
					defaultValue="general"
					value={activeTab}
					onValueChange={setActiveTab}
					className="w-full"
				>
					<div className="border-b border-slate-200">
						<TabsList className="w-full justify-start rounded-none h-14 bg-transparent p-0">
							{TABS.map((tab) => (
								<TabsTrigger
									key={tab.id}
									value={tab.id}
									className={`flex items-center gap-2 px-4 py-2 rounded-none border-b-2 h-14 data-[state=active]:border-blue-600 data-[state=active]:text-blue-600 data-[state=active]:bg-transparent hover:text-blue-600 transition-colors`}
								>
									{tab.icon}
									<span>{tab.label}</span>
								</TabsTrigger>
							))}
						</TabsList>
					</div>

					{/* Description for active tab */}
					<div className="px-4 py-3 bg-slate-50 border-b border-slate-200">
						<p className="text-sm text-slate-600">
							{TABS.find((tab) => tab.id === activeTab)?.description}
						</p>
					</div>

					<TabsContent value="general" className="p-6">
						<div className="grid gap-6">
							<div className="max-w-3xl">
								<h2 className="font-semibold text-lg text-slate-900 mb-1">
									General Settings
								</h2>
								<p className="text-sm text-slate-500 mb-4">
									Configure your store's basic settings and preferences
								</p>
								<form onSubmit={onSubmit} className="space-y-6">
									<Card className="border-slate-200 shadow-lg">
										<div className="space-y-2">
											<Label htmlFor="siteName">Site Name</Label>
											<Input
												id="siteName"
												name="siteName"
												value={formData.siteName}
												onChange={handleInputChange}
												placeholder="Your Store Name"
												className="max-w-md"
												required
											/>
											<p className="text-sm text-slate-500">
												This will appear in the header and browser tab
											</p>
										</div>
									</Card>

									<Card className="border-slate-200 shadow-lg">
										<div className="space-y-2">
											<Label htmlFor="contactEmail">Contact Email</Label>
											<Input
												id="contactEmail"
												name="contactEmail"
												type="email"
												value={formData.contactEmail}
												onChange={handleInputChange}
												placeholder="contact@example.com"
												className="max-w-md"
												required
											/>
											<p className="text-sm text-slate-500">
												Primary email for customer inquiries
											</p>
										</div>
										<div className="space-y-2">
											<Label htmlFor="contactPhone">Contact Phone</Label>
											<Input
												id="contactPhone"
												name="contactPhone"
												value={formData.contactPhone}
												onChange={handleInputChange}
												placeholder="+1 (234) 567-8900"
												className="max-w-md"
												required
											/>
											<p className="text-sm text-slate-500">
												Business phone number for customer support
											</p>
										</div>
									</Card>

									<Card className="border-slate-200 shadow-lg">
										<div className="space-y-2">
											<Label htmlFor="deliveryFee">Delivery Fee</Label>
											<div className="relative max-w-md">
												<DollarSign className="absolute left-3 top-2.5 h-4 w-4 text-slate-500" />
												<Input
													id="deliveryFee"
													name="deliveryFee"
													type="number"
													step="0.01"
													min="0"
													value={formData.deliveryFee}
													onChange={handleInputChange}
													placeholder="5.00"
													className="pl-9"
													required
												/>
											</div>
											<p className="text-sm text-slate-500">
												Standard delivery fee for orders
											</p>
										</div>
										<div className="space-y-2">
											<Label htmlFor="minOrderAmount">Minimum Order Amount</Label>
											<div className="relative max-w-md">
												<DollarSign className="absolute left-3 top-2.5 h-4 w-4 text-slate-500" />
												<Input
													id="minOrderAmount"
													name="minOrderAmount"
													type="number"
													step="0.01"
													min="0"
													value={formData.minOrderAmount}
													onChange={handleInputChange}
													placeholder="50.00"
													className="pl-9"
													required
												/>
											</div>
											<p className="text-sm text-slate-500">
												Minimum amount required for checkout
											</p>
										</div>
									</Card>

									<div className="flex justify-end gap-4 mt-8">
										<Button
											type="submit"
											size="lg"
											disabled={isLoading}
											className="px-8 py-3 text-base font-semibold bg-blue-600 hover:bg-blue-700 text-white shadow-md transition-all rounded-xl"
										>
											{isLoading ? (
												<>
													<AlertCircle className="mr-2 h-4 w-4 animate-spin" />
													Saving Changes...
												</>
											) : (
												"Save Changes"
											)}
										</Button>
									</div>
								</form>
							</div>
						</div>
					</TabsContent>

					<TabsContent value="content" className="p-6">
						<ContentSettingsForm />
					</TabsContent>
				</Tabs>
			</Card>
		</div>
	)
}