import Link from "next/link"
import { ChevronRight } from "lucide-react"
import Image from 'next/image'

export default function Home() {
  return (
    <div className="min-h-screen bg-white">
      {/* Top navigation bar */}
      <div className="bg-black text-white">
        <div className="container mx-auto flex items-center justify-between px-4">
          <div className="flex items-center space-x-4">
            <Link href="#" className="border-b-2 border-red-600 py-3 text-sm font-medium">
              Personal
            </Link>
            <Link href="#" className="py-3 text-sm font-medium">
              Business
            </Link>
            <Link href="#" className="py-3 text-sm font-medium">
              Global Banking and Markets
            </Link>
            <Link href="#" className="py-3 text-sm font-medium">
              Global Private Banking
            </Link>
          </div>
          <div className="flex items-center space-x-2">
            <div className="flex items-center">
              <span className="text-sm">English</span>
              <ChevronRight className="h-4 w-4 rotate-90" />
            </div>
            <div className="bg-red-600 px-4 py-3">
              <span className="text-sm font-medium">Log on</span>
              <ChevronRight className="ml-1 inline h-4 w-4 rotate-90" />
            </div>
          </div>
        </div>
      </div>

      {/* Logo and main navigation */}
      <div className="border-b border-gray-200">
        <div className="container mx-auto flex items-center px-4 py-2">
          <Link href="#" className="mr-8">
            <Image 
              src="/hongkong-hsbc-logo-en.svg" 
              alt="HSBC Logo" 
              width={120} 
              height={40}
              priority
            />
          </Link>
          <nav className="flex flex-1 justify-between">
            <div className="flex items-center space-x-8">
              <div className="flex flex-col">
                <Link href="#" className="text-lg font-medium text-black">
                  Banking
                </Link>
                <span className="text-xs text-gray-600">Accounts & Services</span>
              </div>
              <div className="flex flex-col">
                <Link href="#" className="text-lg font-medium text-black">
                  Borrowing
                </Link>
                <span className="text-xs text-gray-600">Cards & Loans</span>
              </div>
              <div className="flex flex-col">
                <Link href="#" className="text-lg font-medium text-black">
                  Investing
                </Link>
                <span className="text-xs text-gray-600">Securities & Currency Exchange</span>
              </div>
              <div className="flex flex-col">
                <Link href="#" className="text-lg font-medium text-black">
                  Insurance
                </Link>
                <span className="text-xs text-gray-600">Protection & Planning</span>
              </div>
              <div className="flex flex-col">
                <Link href="#" className="text-lg font-medium text-black">
                  Insights
                </Link>
                <span className="text-xs text-gray-600">Analysis & Market Data</span>
              </div>
              <div className="flex flex-col">
                <Link href="#" className="text-lg font-medium text-black">
                  Offers
                </Link>
                <span className="text-xs text-gray-600">Latest Rewards</span>
              </div>
            </div>
          </nav>
        </div>
      </div>

      {/* Anniversary Banner */}
      <div className="bg-gradient-to-r from-red-900 to-red-800 py-6 text-white">
        <div className="container mx-auto flex items-center justify-between px-4">
          <div className="flex items-center">
            <h2 className="text-xl font-medium">HSBC 160th Anniversary, explore our story</h2>
            <ChevronRight className="ml-2 h-5 w-5" />
          </div>
          <div className="flex items-center">
            <div className="relative h-10 w-16">
              <div className="absolute inset-0 flex items-center justify-center rounded-md border border-white p-1">
                <span className="text-sm font-bold">160</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="container mx-auto px-4 py-6">
        <div className="grid grid-cols-12 gap-6">
          {/* Main Promo */}
          <div className="col-span-8 overflow-hidden rounded-md relative"
               style={{ backgroundImage: "url('/refreshed_hk_app.jpeg')" }}>
            <div
              className="absolute top-1/2 -translate-y-1/2 w-1/2 bg-white/90 p-8 backdrop-blur-sm"
              style={{ marginLeft: '50px' }}
            >
              <h2 className="mb-4 text-3xl font-medium text-black">The refreshed HSBC HK App</h2>
              <p className="mb-6 text-gray-700">We are making your banking simpler and more personalised with an upgraded experience to your HSBC HK App.</p>
              <button className="bg-red-600 px-6 py-3 text-white">Learn more</button>
            </div>
          </div>

          {/* Side Promos */}
          <div className="col-span-4 flex flex-col space-y-4">
            <div className="rounded-md bg-gray-700 p-6 text-white">
              <h3 className="mb-2 text-xl font-medium">
                Refer your friends now <ChevronRight className="ml-1 inline h-4 w-4" />
              </h3>
              <p className="text-sm">
                Enjoy HKD1,500 cash rebate for every successful referral with HSBC Premier. T&Cs apply.
              </p>
            </div>
            <div className="rounded-md bg-gray-700 p-6 text-white">
              <h3 className="mb-2 text-xl font-medium">
                Join HSBC Premier Elite <ChevronRight className="ml-1 inline h-4 w-4" />
              </h3>
              <p className="text-sm">
                Up to 64% off on comprehensive health check programmes at designated private hospital groups. T&Cs
                apply.
              </p>
            </div>
          </div>
        </div>

        {/* Feature Boxes */}
        <div className="mt-8 grid grid-cols-3 gap-6">
          <div className="col-span-1">
            <h3 className="mb-4 text-xl font-medium text-black">
              Draw cash, quick & easy <ChevronRight className="ml-1 inline h-4 w-4 text-red-600" />
            </h3>
            <p className="text-sm text-gray-700">
              Use the HSBC HK App to draw cash out of your credit card conveniently and get instant application result.
            </p>
          </div>
          <div className="col-span-1">
            <h3 className="mb-4 text-xl font-medium text-black">
              Revolving Credit Facility <ChevronRight className="ml-1 inline h-4 w-4 text-red-600" />
            </h3>
            <p className="text-sm text-gray-700">160th anniversary - enjoy a 3-month intro rate as low as 1.60% p.a.</p>
          </div>
          <div className="col-span-1">
            <div className="mb-4">
              <h3 className="text-xl font-medium text-black">
                Bill Payment <ChevronRight className="ml-1 inline h-4 w-4 text-red-600" />
              </h3>
              <p className="text-sm text-gray-700">
                Get rebate when paying bills to finance companies by card. T&Cs apply.
              </p>
            </div>
            <div className="mt-6">
              <h3 className="text-xl font-medium text-black">
                Refer your friends now <ChevronRight className="ml-1 inline h-4 w-4 text-red-600" />
              </h3>
              <p className="text-sm text-gray-700">
                Enjoy HKD1,500 cash rebate for every successful referral with HSBC Premier. T&Cs apply.
              </p>
            </div>
          </div>
        </div>

        {/* Bottom Promos */}
        <div className="mt-8 grid grid-cols-3 gap-6">
          <div className="col-span-1 overflow-hidden rounded-md border border-gray-200">
            <div
              className="relative h-48 bg-blue-900 bg-cover bg-center"
              style={{ backgroundImage: "url('/hsbc_one_20.jpeg')" }}
            >
            </div>
            <div className="p-4">
              <h3 className="mb-4 text-xl font-medium text-black">
                HSBC One 2.0 Offer <ChevronRight className="ml-1 inline h-4 w-4 text-red-600" />
              </h3>
              <p className="text-sm text-gray-700">
                Register to earn up to 5.7% p.a. HKD savings interest rate by fulfilling all challenges.
              </p>
            </div>
          </div>
          <div className="col-span-1 overflow-hidden rounded-md border border-gray-200">
            <div
              className="relative h-48 bg-blue-900 bg-cover bg-center"
              style={{ backgroundImage: "url('/draw_cash.jpeg')" }}
            >
            </div>
            <div className="p-4">
              <h3 className="mb-4 text-xl font-medium text-black">
                Draw cash, quick & easy <ChevronRight className="ml-1 inline h-4 w-4 text-red-600" />
              </h3>
              <p className="text-sm text-gray-700">
                Use the HSBC HK App to draw cash out of your credit card conveniently and get instant application
                result.
              </p>
            </div>
          </div>
          <div className="col-span-1 overflow-hidden rounded-md border border-gray-200">
            <div
              className="relative h-48 bg-blue-900 bg-cover bg-center"
              style={{ backgroundImage: "url('/earn_hk_100.jpeg')" }}
            >
            </div>
            <div className="p-4">
              <h3 className="mb-4 text-xl font-medium text-black">
                Earn HK$1,000 Apple Store Gift Card <ChevronRight className="ml-1 inline h-4 w-4 text-red-600" />
              </h3>
              <p className="text-sm text-gray-700">
                Join HSBC Trade25 to enjoy $0 commission & complete just 10 HK/US stock trades to earn HK$1000 Apple
                Gift Card!
              </p>
            </div>
          </div>
        </div>

        {/* Second Row of Bottom Promos */}
        <div className="mt-8 grid grid-cols-3 gap-6">
          <div className="col-span-1 overflow-hidden rounded-md border border-gray-200">
            <div 
              className="relative h-48 bg-gray-100"
              style={{ backgroundImage: "url('/hsbc_premier.jpeg')" }}
            >
            </div>
            <div className="p-4">
              <h3 className="mb-4 text-xl font-medium text-black">
                HSBC Premier <ChevronRight className="ml-1 inline h-4 w-4 text-red-600" />
              </h3>
              <p className="text-sm text-gray-700">
                Enjoy fee-free global transfer, worldwide Premier status and exclusive benefits.
              </p>
            </div>
          </div>
          <div className="col-span-1 overflow-hidden rounded-md border border-gray-200">
            <div 
              className="relative h-48 bg-gray-100"
              style={{ backgroundImage: "url('/hsbc_one2.jpeg')" }}
            >
            </div>
            <div className="p-4">
              <h3 className="mb-4 text-xl font-medium text-black">
                HSBC One 2.0 <ChevronRight className="ml-1 inline h-4 w-4 text-red-600" />
              </h3>
              <p className="text-sm text-gray-700">
                Banking upgraded, rewards reimagined. HSBC One 2.0 elevates banking and lifestyle experience!
              </p>
            </div>
          </div>
          <div className="col-span-1 overflow-hidden rounded-md border border-gray-200">
            <div 
              className="relative h-48 bg-gray-100"
              style={{ backgroundImage: "url('/investment.jpeg')" }}
            >
            </div>
            <div className="p-4">
              <h3 className="mb-4 text-xl font-medium text-black">
                Investment <ChevronRight className="ml-1 inline h-4 w-4 text-red-600" />
              </h3>
              <p className="text-sm text-gray-700">
                Compare our wealth products, and find the right solution for you.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
