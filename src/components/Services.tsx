import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  Input,
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  Button,
  Sheet,
  SheetContent,
  SheetFooter,
  SheetHeader,
  SheetTrigger,
  Label,
} from "@/components";
import { useServiceStore } from "@/hooks";
import { ChevronDown } from "lucide-react";
import * as React from "react";

/**
 * Assumptions:
 *  - all services are availabe in all regions
 *  - all services have the same configuration options
 *  - Assume calculation is based on monthly usage
 *  - Assume all services have the same unit of usage
 *
 */
const regions = [
  "us-east-1",
  "us-east-2",
  "us-west-1",
  "us-west-2",
  "eu-central-1",
  "eu-west-1",
  "eu-west-2",
  "eu-west-3",
  "eu-north-1",
  "ap-east-1",
  "ap-south-1",
  "ca-central-1",
  "cn-north-1",
  "cn-northwest-1",
];
const services = [
  {
    name: "AmazonEKS",
    Configurations: [
      {
        tennacy: "shared",
        regions,
        unit: "sec",
      },
    ],
  },
  {
    name: "AWSLambda",
    Configurations: [
      {
        tennacy: "shared",
        regions,
        unit: "sec",
      },
    ],
  },
  {
    name: "AmazonECS",
    Configurations: [
      {
        tennacy: "shared",
        regions,
        unit: "sec",
      },
    ],
  },
  {
    name: "AmazonEC2",
    Configurations: [
      {
        tennacy: "shared",
        regions,
        unit: "sec",
      },
    ],
  },
];

const RegionMenu = () => {
  const setRegion = useServiceStore((s) => s.setValue);
  const region = useServiceStore((s) => s.region);

  return (
    <DropdownMenu>
      <DropdownMenuTrigger className="w-full">
        <Button variant="outline" className="flex w-full justify-between px-2">
          <div className="">
            <ChevronDown className="mr-1 inline-block text-muted" />
            Choose Region
          </div>
          {region && <span className="font-bold">{region}</span>}
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent>
        {regions.map((region, i) => (
          <DropdownMenuItem
            key={i}
            onSelect={() => {
              setRegion("region", region);
            }}
          >
            {region}
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  );
};

const ConfigureDialog = ({ name }: { name: string }) => {
  const calculateServiceCost = useServiceStore((s) => s.calculateServiceCost);
  const usage = useServiceStore((s) => s.usage);
  const region = useServiceStore((s) => s.region);
  const setValue = useServiceStore((s) => s.setValue);

  return (
    <Sheet>
      <SheetTrigger asChild type="button">
        <Button size="sm" variant="outline">
          Configure
        </Button>
      </SheetTrigger>
      <SheetContent>
        <div className="flex h-full flex-col">
          <SheetHeader className="border-b pb-1 font-semibold">
            Configure {name}
          </SheetHeader>
          <div className="mb-2 space-y-3 py-4">
            <RegionMenu />
            <div>
              <Label htmlFor="usage">Usage</Label>
              <Input
                value={usage}
                onChange={(e) => setValue("usage", +e.currentTarget.value)}
                type="number"
                name="usage"
                placeholder="Usage amount in seconds"
              />
            </div>
          </div>
          <SheetFooter className="pb-6 pt-2">
            <Button type="button" variant="outline">
              Cancel
            </Button>
            <SheetTrigger asChild type="button">
              <Button
                disabled={!usage || !region}
                onClick={() => {
                  if (usage && region) {
                    // order matters
                    setValue("service_code", name);
                    calculateServiceCost();
                  }
                }}
              >
                Add Service
              </Button>
            </SheetTrigger>
          </SheetFooter>
        </div>
      </SheetContent>
    </Sheet>
  );
};

const ServiceCard = ({ name }: (typeof services)[number]) => {
  const services = useServiceStore((s) => s.services);

  const initailSaving =
    services.find((s) => s.service_code === name)?.savings ?? 0;

  const [saving, setSaving] = React.useState(initailSaving);

  React.useEffect(() => {
    setSaving(services.find((s) => s.service_code === name)?.savings ?? 0);
  }, [initailSaving, name, services]);

  return (
    <Card className="border-none shadow">
      <CardHeader>
        {name}
        {saving > 0 && (
          <span className="inline-block text-teal-400">-{saving} USD</span>
        )}{" "}
      </CardHeader>
      <CardFooter className="flex justify-end">
        <ConfigureDialog name={name} />
      </CardFooter>
    </Card>
  );
};

export const ServicesList = () => {
  return (
    <div className="space-y-3">
      <div className="grid grid-cols-2 gap-3">
        {services.map((service, i) => (
          <ServiceCard key={i} {...service} />
        ))}
      </div>
      <SavingCard />
    </div>
  );
};

export const SavingCard = () => {
  const [openSavingCard, setOpenSavingCard] = React.useState(false);
  const services = useServiceStore((s) => s.services);
  const getAllSavings = useServiceStore((s) => s.getAllSavings);
  const [totalSavings, setTotalSavings] = React.useState(0);

  return (
    <div className="space-y-2 pt-1">
      {openSavingCard && (
        <Card className="grid place-items-start pt-3">
          <CardContent className="pb-4 text-xl font-semibold">
            Your estimated savings are
            <span className="ml-1 text-teal-300">
              -{totalSavings.toFixed(2)} USD
            </span>{" "}
            per month
          </CardContent>
        </Card>
      )}
      <Button
        type="button"
        size="lg"
        onClick={async (e) => {
          e.preventDefault();
          if (services.length === 0) {
            alert("Please add service first");
          } else {
            setTotalSavings(getAllSavings(services));
            await useServiceStore.persist.rehydrate();
            setOpenSavingCard(true);
          }
        }}
        className="w-full"
      >
        Calculate total savings
      </Button>
    </div>
  );
};
