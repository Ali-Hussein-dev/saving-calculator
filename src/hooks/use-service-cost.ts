import { create } from "zustand";
import { persist } from "zustand/middleware";

import data from "../../data.json";
import { updateArray } from "@/lib/utils";

type State = {
    region?: string;
    service_code?: string;
    service_cost?: number;
    rate?: number;
    usage: number; // in seconds
    services: { service_code: string; savings: number }[];
};

type Action = {
    setValue: <K extends keyof State>(name: K, value: State[K]) => void;
    calculateServiceCost: () => void;
    getAllSavings: (
        services: { service_code: string; savings: number }[],
    ) => number;
};

// Create your store, which includes both state and (optionally) actions
export const useServiceStore = create<State & Action>()(
    persist(
        (set) => ({
            usage: 0,
            services: [],
            setValue: (name, value) => set(() => ({ [name]: value })),
            calculateServiceCost: () =>
                set((s) => {
                    // @ts-expect-error typescript can't type from json
                    const rate = data.find(
                        (item: { service_code: string }) =>
                            // item.region === s.region &&
                            item?.service_code === s.service_code,
                    )?.rate;
                    if (typeof rate !== "number") {
                        console.error(rate);
                        return s;
                    }
                    const service_cost = +(rate * s.usage).toFixed(2);

                    const updatedServices = updateArray(
                        s.services,
                        {
                            service_code: s.service_code!,
                            savings: +(0.6 * service_cost).toFixed(2),
                        },
                        (item) => item.service_code,
                    );

                    const state: State & Action = {
                        ...s,
                        service_cost,
                        rate,
                        services: updatedServices,
                    };
                    return state;
                }),
            getAllSavings: (services) =>
                services.reduce((acc, curr) => acc + curr.savings, 0),
        }),
        {
            name: "service-cost",
        },
    ),
);
