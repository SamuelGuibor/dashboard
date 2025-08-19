"use client";

import { useState, useEffect } from "react";
import { useSession, signOut } from "next-auth/react";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/app/_components/ui/card";
import { Input } from "@/app/_components/ui/input";
import { Button } from "@/app/_components/ui/button";
import {
  Label,
  PolarGrid,
  PolarRadiusAxis,
  RadialBar,
  RadialBarChart,
} from "recharts";
import { ChartConfig, ChartContainer } from "@/app/_components/ui/chart";
import { GetValue } from "@/app/_actions/get-value";
import { updateData } from "@/app/_actions/update-dash";

interface DataValue {
  id: string;
  name: string;
  value: string;
}

interface ChartRadialTextsProps {
  title: string;
  value: number;
  label: string;
  id: string;
  onEdit: (id: string, currentValue: string) => void;
  onSave: (id: string) => void;
  onCancel: () => void;
  isEditing: boolean;
  editValue: string;
  setEditValue: (value: string) => void;
}

function ChartRadialTexts({
  title,
  value,
  label,
  id,
  onEdit,
  onSave,
  onCancel,
  isEditing,
  editValue,
  setEditValue,
}: ChartRadialTextsProps) {
  const { data: session } = useSession();

  const chartConfig = {
    visitors: {
      label: "Visitors",
    },
    safari: {
      label: "Safari",
      color: "var(--chart-2)",
    },
  } satisfies ChartConfig;

  const totalMatch = label.match(/(\d+)/);
  const total = totalMatch ? parseInt(totalMatch[1], 10) : 100;
  const percentage = total > 0 ? (value / total) * 100 : 0;
  const endAngle = -270 + (percentage / 100) * 360;
  const reachedGoal = value >= total;
  const barColor = reachedGoal ? "#22c55e" : "#ef4444";

  const chartData = [{ name: title, visitors: value, fill: barColor }];

  return (
    <Card className="flex flex-col">
      <CardHeader className="items-center pb-0">
        <CardTitle>{title}</CardTitle>
      </CardHeader>
      <CardContent className="flex-1 pb-0">
        {isEditing && session?.user ? (
          <div className="flex flex-col gap-2 items-center pt-10">
            <Input
              type="number"
              value={editValue}
              onChange={(e) => setEditValue(e.target.value)}
              className="text-2xl w-full text-center"
            />
            <div className="flex gap-2">
              <Button onClick={() => onSave(id)}>Salvar</Button>
              <Button variant="outline" onClick={onCancel}>
                Cancelar
              </Button>
            </div>
          </div>
        ) : (
          <>
            <ChartContainer
              config={chartConfig}
              className="mx-auto aspect-square max-h-[250px]"
            >
              <RadialBarChart
                data={chartData}
                startAngle={-270}
                endAngle={endAngle}
                innerRadius={80}
                outerRadius={110}
              >
                <PolarGrid
                  gridType="circle"
                  radialLines={false}
                  stroke="none"
                  className="first:fill-muted last:fill-background"
                  polarRadius={[86, 74]}
                />
                <RadialBar dataKey="visitors" background cornerRadius={10} />
                <PolarRadiusAxis tick={false} tickLine={false} axisLine={false}>
                  <Label
                    content={({ viewBox }) => {
                      if (viewBox && "cx" in viewBox && "cy" in viewBox) {
                        return (
                          <text
                            x={viewBox.cx}
                            y={viewBox.cy}
                            textAnchor="middle"
                            dominantBaseline="middle"
                          >
                            <tspan
                              x={viewBox.cx}
                              y={viewBox.cy}
                              className="fill-foreground text-4xl font-bold"
                            >
                              {value}
                            </tspan>
                            <tspan
                              x={viewBox.cx}
                              y={(viewBox.cy || 0) + 24}
                              className="fill-muted-foreground"
                            >
                              {label}
                            </tspan>
                          </text>
                        );
                      }
                    }}
                  />
                </PolarRadiusAxis>
              </RadialBarChart>
            </ChartContainer>
            {session?.user && (
              <Button
                variant="link"
                className="mt-2"
                onClick={() => onEdit(id, value.toString())}
              >
                Editar
              </Button>
            )}
          </>
        )}
      </CardContent>
    </Card>
  );
}

export default function Dashboard() {
  const { data: session } = useSession();
  const [data, setData] = useState<DataValue[]>([]);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editValue, setEditValue] = useState<string>("");

  // Fetch data on mount
  useEffect(() => {
    async function fetchData() {
      try {
        const titles = [
          "Fechados Total",
          "Fechados Mês",
          "Fechados Dia",
          "Colher Assinados",
          "Aguardando prontuário",
          "Em distribuição HRCA",
          "Em análise",
          "Com pendência",
          "Pagos HRCA",
        ];
        const fetchedData: DataValue[] = [];
        for (const title of titles) {
          const values = await GetValue(title);
          if (values.length > 0) {
            fetchedData.push(values[0]); // Assuming one record per name
          }
        }
        setData(fetchedData);
      } catch (error) {
        console.error("Failed to fetch data:", error);
        alert("Não foi possível carregar os dados.");
      }
    }
    fetchData();
  }, []);

  // Handle edit button click
  const handleEdit = (id: string, currentValue: string) => {
    setEditingId(id);
    setEditValue(currentValue);
  };

  // Handle save button click
  const handleSave = async (id: string) => {
    try {
      const updated = await updateData({ id, value: editValue });
      setData((prev) =>
        prev.map((item) => (item.id === id ? updated : item))
      );
      setEditingId(null);
      setEditValue("");
    } catch (error) {
      console.error("Failed to update data:", error);
      alert("Não foi possível atualizar o valor.");
    }
  };

  // Handle cancel button click
  const handleCancel = () => {
    setEditingId(null);
    setEditValue("");
  };

  // Handle sign-out
  const handleSignOut = async () => {
    try {
      await signOut({ redirect: true, callbackUrl: "/" });
    } catch (error) {
      console.error("Failed to sign out:", error);
      alert("Não foi possível sair da sessão.");
    }
  };

  return (
    <div className="flex flex-col gap-4 p-4">
      {session?.user && (
        <div className="flex justify-end">
          <Button variant="link" onClick={handleSignOut}>
            Sair da sessão
          </Button>
        </div>
      )}
      <div className="flex gap-4">
        <div className="flex flex-col gap-4 w-[280px]">
          {data
            .filter((item) =>
              ["Fechados Total", "Fechados Mês", "Fechados Dia"].includes(item.name)
            )
            .map(({ id, name, value }) => (
              <ChartRadialTexts
                key={id}
                title={name}
                value={parseInt(value, 10)}
                label={
                  name === "Fechados Mês"
                    ? "de 100"
                    : name === "Fechados Dia"
                    ? "de 3"
                    : ""
                }
                id={id}
                onEdit={handleEdit}
                onSave={handleSave}
                onCancel={handleCancel}
                isEditing={editingId === id}
                editValue={editValue}
                setEditValue={setEditValue}
              />
            ))}
        </div>

        <div className="grid grid-cols-2 gap-2 flex-1 w-[50%]">
          {data
            .filter(
              (item) =>
                !["Fechados Total", "Fechados Mês", "Fechados Dia"].includes(
                  item.name
                )
            )
            .map(({ id, name, value }) => (
              <Card key={id}>
                <CardHeader>
                  <CardTitle className="text-3xl font-semibold text-center">
                    {name}
                  </CardTitle>
                </CardHeader>
                <CardContent className="text-5xl font-bold text-center pt-4">
                  {editingId === id && session?.user ? (
                    <div className="flex flex-col gap-2">
                      <Input
                        type="number"
                        value={editValue}
                        onChange={(e) => setEditValue(e.target.value)}
                        className="text-2xl w-full text-center"
                      />
                      <div className="flex gap-2 justify-center">
                        <Button onClick={() => handleSave(id)}>Salvar</Button>
                        <Button variant="outline" onClick={handleCancel}>
                          Cancelar
                        </Button>
                      </div>
                    </div>
                  ) : (
                    <div>
                      {parseInt(value, 10)}
                      {session?.user && (
                        <Button
                          variant="link"
                          className="ml-2"
                          onClick={() => handleEdit(id, value)}
                        >
                          Editar
                        </Button>
                      )}
                    </div>
                  )}
                </CardContent>
              </Card>
            ))}
        </div>
      </div>
    </div>
  );
}