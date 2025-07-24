"use client";

import React from "react";
import { useForm, Controller, Control } from "react-hook-form";
import RTE from "./RTEClient";
import MetaDescription from "./MetaDescription";
import { Input } from "@/components/ui/input";
import { Label } from "@radix-ui/react-label";
import slugify from "../utils/slugify";
import { Models, ID } from "appwrite";
import { useRouter } from "next/navigation";
import { databases, storage } from "@/models/client/config";
import { db, featuredImageBucket, blogCollection } from "@/models/name";
import Image from "next/image";

interface BlogFormValues {
  title: string;
  description: string;
  content: string;
  tags: string[];
  featuredImage: File | null;
  slug: string;
}

const AddNewBlog = ({ blog }: { blog?: Models.Document }) => {
  const router = useRouter();
  const [tagInput, setTagInput] = React.useState("");
  const [loading, setLoading] = React.useState(false);
  const [error, setError] = React.useState("");
  const [slugManuallyEdited, setSlugManuallyEdited] = React.useState(false);

  const getBlogField = <T,>(field: keyof BlogFormValues, fallback: T): T =>
    blog && field in blog ? (blog[field] as T) : fallback;

  const {
    register,
    handleSubmit,
    control,
    setValue,
    watch,
    formState: { errors },
  } = useForm<BlogFormValues>({
    defaultValues: {
      title: getBlogField("title", ""),
      description: getBlogField("description", ""),
      content: getBlogField("content", ""),
      tags: getBlogField("tags", []),
      featuredImage: null,
      slug: getBlogField("slug", ""),
    },
  });

  // For image preview
  const [imagePreview, setImagePreview] = React.useState<string | null>(null);

  // Initialize image preview for edit mode
  React.useEffect(() => {
    if (blog && blog.featuredImage) {
      const imageUrl = `/api/image-proxy?bucket=${encodeURIComponent(blog.featuredImageBucket || 'featuredImage')}&id=${encodeURIComponent(blog.featuredImage)}`;
      setImagePreview(imageUrl);
    }
  }, [blog]);

  // Update image preview when featuredImage changes
  React.useEffect(() => {
    const subscription = watch((value, { name }) => {
      if (name === "featuredImage" && value.featuredImage instanceof File) {
        const file = value.featuredImage;
        if (file) {
          const reader = new FileReader();
          reader.onloadend = () => {
            setImagePreview(reader.result as string);
          };
          reader.readAsDataURL(file);
        } else {
          setImagePreview(null);
        }
      }
    });
    return () => subscription.unsubscribe();
  }, [watch]);

  const tags = watch("tags");
  const title = watch("title");
  const slug = watch("slug");

  React.useEffect(() => {
    if (!slugManuallyEdited) {
      setValue("slug", slugify(title || ""));
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [title]);

  // When the user edits the slug input, set slugManuallyEdited to true
  React.useEffect(() => {
    const currentSlug = slug;
    const slugifiedTitle = slugify(title || "");
    // Only update slug if blog does not exist (new blog), and slug is empty or matches the previous slugified title
    if (
      !blog &&
      (currentSlug === slugify("") || currentSlug === "")
    ) {
      setValue("slug", slugifiedTitle);
    }
  }, [title, setValue, blog, slug]);

  const handleAddTag = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if ((e.key === "Enter" || e.key === ",") && tagInput.trim()) {
      e.preventDefault();
      if (!tags.includes(tagInput.trim())) {
        setValue("tags", [...tags, tagInput.trim()]);
      }
      setTagInput("");
    }
  };

  const handleRemoveTag = (tag: string) => {
    setValue(
      "tags",
      tags.filter((t) => t !== tag)
    );
  };

  const create = async (data: BlogFormValues) => {
    if (!data.featuredImage) throw new Error("Please upload an image");
    const storageResponse = await storage.createFile(
      featuredImageBucket,
      ID.unique(),
      data.featuredImage
    );
    const response = await databases.createDocument(
      db,
      blogCollection,
      ID.unique(),
      {
        title: data.title,
        description: data.description,
        featuredImage: storageResponse.$id,
        tags: data.tags,
        content: data.content,
        slug: data.slug,
      }
    );
    return response;
  };

  const update = async (data: BlogFormValues) => {
    if (!blog) throw new Error("Blog does not exist");
    const featuredImageId = await (async () => {
      if (!data.featuredImage) return blog?.featuredImageId as string;
      await storage.deleteFile(featuredImageBucket, blog.featuredImage.Id);
      const file = await storage.createFile(
        featuredImageBucket,
        ID.unique(),
        data.featuredImage
      );
      return file.$id;
    })();
    const response = await databases.updateDocument(
      db,
      blogCollection,
      blog.$id,
      {
        title: data.title,
        description: data.description,
        content: data.content,
        tags: data.tags,
        slug: data.slug,
        featuredImage: featuredImageId,
      }
    );
    return response;
  };

  const onSubmit = async (data: BlogFormValues) => {
    if (
      !data.title ||
      !data.description ||
      !data.slug ||
      !data.content ||
      !data.tags.length
    ) {
      setError("Please fill out all fields");
      return;
    }
    setLoading(true);
    setError("");
    try {
      const response = blog ? await update(data) : await create(data);
      router.push(`/blogs/${response.$id}/${slugify(data.title)}`);
    } catch (error: unknown) {
      if (error instanceof Error) {
      setError(error.message);
      } else {
        setError("An unknown error occurred");
      }
    }
    setLoading(false);
  };

  return (
    <div className="max-w-4xl mx-auto p-4">
      <div className="bg-zinc-50 dark:bg-zinc-900 shadow-2xl rounded-2xl p-8 transition-all duration-300">
        <h2 className="text-3xl font-extrabold mb-10 text-center text-blue-700 dark:text-blue-300 tracking-tight">Add New Blog</h2>
        <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-10">
          {/* Blog Details Section */}
          <div className="space-y-6">
            <h3 className="text-xl font-bold mb-2 text-blue-600 dark:text-blue-400">Blog Details</h3>
            <div>
              <Label htmlFor="title" className="text-base font-medium">Title</Label>
              <Input id="title" {...register("title", { required: true })} placeholder="Blog title" autoFocus className="rounded-lg px-4 py-2 mt-1 focus:ring-2 focus:ring-blue-400 focus:border-blue-400 transition-all" />
              {errors.title && <span className="bg-red-500 text-white text-xs flex items-center gap-1 mt-2 px-2 py-1 rounded animate-fade-in"><span>⚠️</span> Title is required</span>}
            </div>
            <div>
              <Label htmlFor="slug" className="text-base font-medium">Slug</Label>
              <Input
                id="slug"
                {...register("slug", { required: true })}
                placeholder="blog-title-slug"
                value={slug}
                onChange={e => {
                  setValue("slug", e.target.value);
                  setSlugManuallyEdited(true);
                }}
                className="rounded-lg px-4 py-2 mt-1 focus:ring-2 focus:ring-blue-400 focus:border-blue-400 transition-all"
              />
              {errors.slug && <span className="bg-red-500 text-white text-xs flex items-center gap-1 mt-2 px-2 py-1 rounded animate-fade-in"><span>⚠️</span> Slug is required</span>}
            </div>
          </div>

          {/* Content Section */}
          <div className="space-y-4">
            <h3 className="text-xl font-bold mb-2 text-blue-600 dark:text-blue-400">Content</h3>
            <div className="w-full bg-white dark:bg-zinc-800 rounded-lg shadow">
              {/* eslint-disable-next-line @typescript-eslint/no-explicit-any */}
              <RTE name="content" control={control as Control<any>} />
            </div>
            {errors.content && <span className="bg-red-500 text-white text-xs flex items-center gap-1 mt-2 px-2 py-1 rounded animate-fade-in"><span>⚠️</span> Content is required</span>}
          </div>

          {/* Meta Description Section */}
          <div className="space-y-2">
            <h3 className="text-xl font-bold mb-2 text-blue-600 dark:text-blue-400">Meta Description</h3>
            <MetaDescription control={control} name="description" />
            {errors.description && <span className="bg-red-500 text-white text-xs flex items-center gap-1 mt-2 px-2 py-1 rounded animate-fade-in"><span>⚠️</span> Description is required</span>}
          </div>

          {/* Tags Section */}
          <div className="space-y-4">
            <h3 className="text-xl font-bold mb-2 text-blue-600 dark:text-blue-400">Tags</h3>
            <div className="flex gap-2 flex-wrap mb-3">
              {tags.map((tag) => (
                <span key={tag} className="bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200 px-4 py-1 rounded-full text-sm flex items-center gap-1 shadow-sm animate-fade-in transition-all duration-200">
                  {tag}
                  <button type="button" onClick={() => handleRemoveTag(tag)} className="ml-1 text-blue-500 hover:text-red-500 transition-colors font-bold">&times;</button>
                </span>
              ))}
            </div>
            <Input
              id="tags"
              value={tagInput}
              onChange={(e) => setTagInput(e.target.value)}
              onKeyDown={handleAddTag}
              placeholder="Type a tag and press Enter or Comma"
              className="rounded-lg px-4 py-2 mt-1 focus:ring-2 focus:ring-blue-400 focus:border-blue-400 transition-all"
            />
          </div>

          {/* Featured Image Section */}
          <div className="space-y-4">
            <h3 className="text-xl font-bold mb-2 text-blue-600 dark:text-blue-400">Featured Image</h3>
            <Controller
              name="featuredImage"
              control={control}
              rules={{ required: !blog }}
              render={({ field }) => (
                <Input
                  id="featuredImage"
                  type="file"
                  accept="image/*"
                  onChange={(e) => {
                    const file = e.target.files ? e.target.files[0] : null;
                    field.onChange(file);
                    if (file) {
                      const reader = new FileReader();
                      reader.onloadend = () => {
                        setImagePreview(reader.result as string);
                      };
                      reader.readAsDataURL(file);
                    } else {
                      setImagePreview(null);
                    }
                  }}
                  className="rounded-lg px-4 py-2 mt-1 focus:ring-2 focus:ring-blue-400 focus:border-blue-400 transition-all"
                />
              )}
            />
            {imagePreview && (
              <div className="mt-6 space-y-4 animate-fade-in">
                <div className="flex justify-center">
                  <Image 
                    src={imagePreview} 
                    alt="Preview" 
                    className="max-h-64 rounded-xl shadow-lg border-2 border-blue-200 object-contain transition-all duration-300" 
                    width={400} 
                    height={256}
                    onError={(e) => {
                      console.error('Preview image failed to load:', imagePreview);
                      e.currentTarget.style.display = 'none';
                    }}
                  />
                </div>
                <div className="flex justify-center">
                  <button
                    type="button"
                    onClick={() => {
                      setImagePreview(null);
                      setValue('featuredImage', null);
                      // Reset the file input
                      const fileInput = document.getElementById('featuredImage') as HTMLInputElement;
                      if (fileInput) fileInput.value = '';
                    }}
                    className="bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded-lg text-sm transition-colors flex items-center gap-2"
                  >
                    🗑️ Remove Image
                  </button>
                </div>
              </div>
            )}
            {errors.featuredImage && <span className="bg-red-500 text-white text-xs flex items-center gap-1 mt-2 px-2 py-1 rounded animate-fade-in"><span>⚠️</span> Image is required</span>}
          </div>

          {/* Error and Submit (full width) */}
          <div className="flex flex-col items-center gap-4 mt-6">
            {error && <div className="bg-red-500 text-white text-sm flex items-center gap-2 px-4 py-2 rounded shadow animate-fade-in"><span>❌</span> {error}</div>}
            <button
              type="submit"
              className="bg-gradient-to-r from-blue-500 to-blue-700 text-white px-8 py-3 rounded-xl font-bold shadow-lg hover:from-blue-600 hover:to-blue-800 transition-all duration-200 flex items-center justify-center gap-2 text-lg"
              disabled={loading}
            >
              {loading && <span className="animate-spin mr-2">⏳</span>}
              {loading ? "Submitting..." : blog ? <><span>📝</span> Update Blog</> : <><span>➕</span> Add Blog</>}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AddNewBlog;
