import { useForm } from "react-hook-form";
import { Link, useNavigate } from "react-router-dom";
import { zodResolver } from "@hookform/resolvers/zod";

import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { LoadingSpinner } from "@/components/connections/components/LoadingSpinner";

import useOrganisationMutation from "@/hooks/mutations/useOrganisationMutation";
import {
  type OrganizationFormSchemaType,
  organizationFormSchema,
} from "./create-organization-schema";


export const CreateOrganizationForm = () => {
  const navigate = useNavigate();
  const { mutate, isPending } = useOrganisationMutation();

  const form = useForm<OrganizationFormSchemaType>({
    resolver: zodResolver(organizationFormSchema),
  });

  const onSubmit = (data: OrganizationFormSchemaType) => {
    mutate(
      { ...data, stripe_customer_id: "stripe-customer-76" },
      {
        onSuccess: () => navigate("/"),
      }
    );
  };

  return (
    <div className="mx-auto w-full max-w-sm lg:w-96">
      <div className="text-center">
        <Link to="/">
          <img src="./../../../../public/logo.png" className="w-14 mx-auto" />
        </Link>
        <h2 className="mt-6 text-3xl font-extrabold">Create Organization</h2>
      </div>

      <Form {...form}>
        <form className="space-y-6 mt-8" onSubmit={form.handleSubmit(onSubmit)}>
          <FormField
            control={form.control}
            name="name"
            render={({ field }) => (
              <FormItem>
                <FormLabel htmlFor="name">Name</FormLabel>
                <FormControl>
                  <Input
                    placeholder="organization"
                    autoComplete="given-name"
                    {...field}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <Button className="w-full" type="submit">
            {isPending ? <LoadingSpinner className="" /> : "Create"}
          </Button>
        </form>
      </Form>
      <Link
        to="/"
        className="mt-4 text-sm font-medium text-primary hover:text-primary/80 text-center block mx-auto"
      >
        Skip For Now
      </Link>
    </div>
  );
};
