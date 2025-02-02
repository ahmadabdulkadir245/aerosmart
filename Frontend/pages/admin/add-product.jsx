import Head from "next/head"
import Header from "../../components/Header"

import dynamic from 'next/dynamic';
import { useEffect, useState } from 'react';

const QuillNoSSRWrapper = dynamic(import('react-quill'), {
  ssr: false,
  loading: () => <p>Loading ...</p>,
})

const modules = {
  toolbar: [
    [{ header: '1' }, { header: '2' }, { header: '3' }, { font: [] }],
    [{ size: [] }],
    ['bold', 'italic', 'underline', 'strike', 'blockquote'],
    [
      { list: 'ordered' },
      { list: 'bullet' },
      { indent: '-1' },
      { indent: '+1' },
    ],
    ['link', 'image', 'video'],
    ['clean'],
  ],
  clipboard: {
    // toggle to add extra line breaks when pasting HTML:
    matchVisual: false,
  },
}

import 'react-quill/dist/quill.snow.css';
import { useRouter } from "next/router";
import Loading from "../../components/Loading";
import { getAuthTokenFromCookie, getUserIDFromCookie } from "../../utils/cookie";



const AddProduct = ({user_id, authToken}) => { 
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const {prodId,  title, oldImage, category, price, description, quantity, brand} = router.query;
  const [isUpdate, setIsUpdate] = useState(false)
  useEffect(() => {
    setTimeout(() => {
      setLoading(false);
    }, 300)
  },[loading]);
  useEffect(() => {
    if(prodId) {
      setProductData({
        title: title,
        price: price,
        category: category,
        brand: brand || '',
        quantity: Number(quantity),
        image_url: oldImage,
        description: description
      })
      setImage(oldImage)
      setContent(description)
      setIsUpdate(true)
    }
  }, [prodId, title, price, category, quantity, oldImage, description])


  const [productData, setProductData] = useState({
    title:  "",
    price:  "",
    brand: "",
    category:  "",
    quantity:  "",
    image_url:  "",
    description:  "",
  })
  const [message, setMessage] = useState({
    state: false,
    message: ''
  })
  const [success, setSuccess] = useState(false)
  const [image, setImage] = useState(null)
  const [content, setContent] = useState('');

  const handleFileInputChange = (event) => {
    setImage(event.target.files[0]);
  };

  const handleAddProduct = async (e) => {
    if (user_id === null) {
      return; // Return early if user_id is null
    }
    e.preventDefault();
    setLoading(true);
  
    try {
      const response = await axios.post('/api/addToProduct', {
        title: productData.title,
        price: Number(productData.price),
        quantity: Number(productData.quantity),
        category: productData.category,
        image: image,
        description: content,
        user_id: user_id,
      });
      
      // Check if the response is successful before proceeding
      if (response.data.success) {
        // Reset form and state
        setProductData({
          title: '',
          price: '',
          brand: "",
          quantity: '',
          category: '',
        });
  
        setContent('');
        setLoading(false);
        setMessage({
          state: true,
          message: 'Product Added Successfully',
        });
  
        setTimeout(() => {
          setMessage({
            state: false,
            message: '',
          });
          setSuccess(false);
        }, 1000);
      } else {
        console.error('Product could not be added:', response.data.message);
        // Handle error case, if needed
      }
    } catch (error) {
      console.error('An error occurred:', error);
      // Handle error case, if needed
    }
  };
  
  const addProductHandler = (e) => {
    if(user_id == null) return
    e.preventDefault()
    setLoading(true)
    const formData = new FormData();
    formData.append('image', image);

    fetch(process.env.NEXT_PUBLIC_PRODUCT_IMAGE_URL, {
      method: 'POST',
      body: formData
    })
    .then(res => res.json())
    .then(fileResData => {
      let image
      return  image = fileResData.image || 'undefined';
    })
    .then(image => {

    let graphqlQuery = {
    query: `
    mutation CreateProduct($title: String!, $price: Int!, $image_url: String!, $description: String!, $category: String, $quantity: Int,brand: String, $user_id: Int) {
      createProduct(productInput: {title: $title, price: $price, image_url: $image_url, description: $description, category: $category, quantity: $quantity, brand: $brand, user_id: $user_id}) {
        title
        price
        quantity
        category
        image_url
        description
        user_id
      }
    }
  `,
    variables: {
      title: productData.title,
      price:Number(productData.price),
      quantity:Number(productData.quantity),
      category: productData.category,
      image_url: image,
      description: content,
      user_id: Number(user_id)
    }
  };

 fetch(process.env.NEXT_PUBLIC_GRAPHQL_URL, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify(graphqlQuery)
  })
    .then(res => {
      return res.json();
    })
    .then(result => {
      setProductData({
        title: "",
        price: "",
        brand: "",
        quantity: "",
        category: ""
      })
      setContent("")
      setLoading(false)
      setMessage({
        state:true,
        message: 'Product Added Successfully'
      })
      setTimeout(() => {
        setMessage({
          state: false,
          message: ''
        })
        setSuccess(false)
      }, 1000);
    })
    })
    .catch(err => console.log(err))
}



const updateDataHandler = () => {

  setLoading(true)
  if(image !== oldImage){
    const formData = new FormData();
    formData.append('image', image);

    fetch(process.env.NEXT_PUBLIC_PRODUCT_IMAGE_URL, {
      method: 'POST',
      body: formData
    })
    .then(res => res.json())
    .then(fileResData => {
      let image
      return  image = fileResData.image || 'undefined';
    })
    .then(image => {
      let graphqlQuery = {
        query: `
        mutation UpdateProduct($id: Int!,$title: String!, $price: Int!, $image_url: String!, $description: String!, $category: String, $quantity: Int, brand: String, user_id: Int) {
          updateProduct(id: $id, productInput: {title: $title, price: $price, image_url: $image_url, description: $description, category: $category, quantity: $quantity, brand: $brand,, user_id: $user_id}) {
            id
            title
            price
            image_url
            description
            category
            quantity
          }
        }
      `,
        variables: {
          id: Number(prodId),
          title: productData.title,
          price: Number(productData.price),
          quantity: Number(productData.quantity),
          category: productData.category,
          image_url: image,
          description: content
        }
      };
      fetch(process.env.NEXT_PUBLIC_GRAPHQL_URL, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(graphqlQuery)
      })
        .then(res => {
          return res.json();
        })
        .then(result => {
          setProductData({
            title: "",
            price: "",
            brand: "",
            quantity: "",
            category: ""
          })
          setContent("")
        setLoading(false)
        setMessage({
          state:true,
          message: 'Product Updated Successfully'
        })
        setTimeout(() => {
          router.back()
          setMessage({
            state: false,
            message: ''
          })
          setSuccess(false)
        }, 1000);
      })
        .catch(err => console.log(err))
      })
  }
  else {
    let graphqlQuery = {
      query: `
      mutation UpdateProduct($id: Int!,$title: String!, $price: Int!, $image_url: String!, $description: String!, $category: String, $quantity: Int, brand: String, user_id: Int) {
        updateProduct(id: $id, productInput: {title: $title, price: $price, image_url: $image_url, description: $description, category: $category, quantity: $quantity, brand: $brand, user_id: $user_id}) {
          id
          title
          price
          image_url
          description
          category
          quantity
        }
      }
    `,
      variables: {
        id: Number(prodId),
        title: productData.title,
        price:Number(productData.price),
        quantity:Number(productData.quantity),
        category: productData.category,
        image_url: image,
        description: content
      }
    };
    fetch(process.env.NEXT_PUBLIC_GRAPHQL_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(graphqlQuery)
    })
      .then(res => {
        return res.json();
      })
      .then(result => {
        setProductData({
          title: "",
          price: "",
          brand: "",
          quantity: "",
          category: ""
        })
        setContent("")
      setLoading(false)
      setMessage({
        state:true,
        message: 'Product Updated Successfully'
      })
      setTimeout(() => {
        router.back()
        setMessage({
          state: false,
          message: ''
        })
        setSuccess(false)
      }, 1000);
      })
      .catch(err => console.log(err))
  }
}

    const productInputHandler = (inputIdentifier, e) => {
      setProductData((currentInputs) => {
        return {
          ...currentInputs,
          [inputIdentifier]: e.target.value,
        };
      });
    };

    if(loading) {
      return <Loading/>
    }


  return (
    <>
    <Header/>
    <div className="">

          <Head>
           {/* fonts import */}
           <link rel='preconnect' href='https://fonts.googleapis.com' />
      </Head>


      <form className="px-[10px]" onSubmit={isUpdate ? updateDataHandler : addProductHandler}>
  <h2 className="text-center text-xl uppercase text-gray-500 my-5 [word-spacing: 10px] font-poppins">
    {isUpdate ? 'Update Product' : 'Add Product'}
    <div className="w-[120px] h-[1px] bg-yellow-500 m-auto"></div>
  </h2>
  {message.state && (
    <p className="text-center text-xs text-green-400 mt-2 mb-1 transition-all duration-300 ease-out">
      {message.message}
    </p>
  )}
          <input
        type='text'
        className='bg-gray-200 lg:border-[1px] rounded-lg  outline-none px-4 py-[16px] focus:ring-2 focus:border-transparent ring-green-400 focus:bg-gray-100 w-full  m-auto flex mb-5 lg:my-5'
        placeholder='product name'
        required
        name="title"
        value={productData.title}
        onChange={productInputHandler.bind(this, 'title')}
      />
        <input
        type='text'
        className='bg-gray-200 lg:border-[1px] rounded-lg  outline-none px-4 py-[16px] focus:ring-2 focus:border-transparent ring-green-400 focus:bg-gray-100 w-full  m-auto flex mb-5 lg:my-5'
        placeholder='product brand'
        required
        name="brand"
        value={productData.brand}
        onChange={productInputHandler.bind(this, 'brand')}
      />
      <div className="flex space-x-4 mb-5">
      <input
        type='number'
        className='bg-gray-200 lg:border-[1px] rounded-lg  outline-none px-4 py-[16px] focus:ring-2 focus:border-transparent ring-green-400 focus:bg-gray-100 w-[50%]  m-auto flex  lg:my-8'
        placeholder='price'
        name="price"
        required
        value={productData.price}
        onChange={productInputHandler.bind(this, 'price')}
      />
      <input
        type='number'
        className='bg-gray-200 lg:border-[1px] rounded-lg  outline-none px-4 py-[16px] focus:ring-2 focus:border-transparent ring-green-400 focus:bg-gray-100 w-[50%]  m-auto flex  lg:my-8'
        placeholder='quantity'
        name="quantity"
        required
        value={productData.quantity}
        onChange={productInputHandler.bind(this, 'quantity')}
      />
      </div>



      <select
        type='text'
        className='bg-gray-200 lg:border-[1px] rounded-lg  outline-none px-4 py-[16px] focus:ring-2 focus:border-transparent ring-green-400 focus:bg-gray-100 w-full  m-auto flex mb-5 lg:my-5'
        placeholder='product category'
        required
        name="category"
        value={productData.category}
        onChange={productInputHandler.bind(this, 'category')}
      >
          <option>select category</option>
          <option>agriculture materials</option>
          <option>bricks, blocks & kerbs</option>
          <option>building materials</option>
          <option>concrete, cement & stones</option>
          <option>doors</option>
          <option>electrical items</option>
          <option>paint</option>
          <option>pulmbing</option>
           <option>roof covering</option>
          <option>tiles</option>
          <option>windows</option>
         <option>wood</option>
          </select>

      <input
        type='file'
        className='bg-gray-200 lg:border-[1px] rounded-lg  outline-none px-4 py-[16px] focus:ring-2 focus:border-transparent ring-green-400 focus:bg-gray-100 w-full  m-auto flex my-6 lg:my-8'
        placeholder='image url'
        name="image_url"
        required
        // value={image}
        onChange={handleFileInputChange}
      />

      <div className="  font-semibold text-gray-500 h-[300px] overflow-y-scroll shadow-md border border-gray-400 rounded-md overflow-hidden">
      <QuillNoSSRWrapper modules={modules} onChange={setContent} value={content} theme="snow" 
        />
      </div>

      <button
    type="submit"
    className={`flex justify-center m-auto mt-5 lg:mt-5 bg-${isUpdate ? 'gray' : 'yellow'}-400 w-56 rounded-full text-white px-2 py-3 2xl:p-3 outline-none transition-all duration-300 ease-in-out hover:bg-${
      isUpdate ? '[#ffcb05]' : 'yellow-500'
    } 2xl:w-[300px] mb-20`}
  >
    {isUpdate ? 'Update' : 'Add'}
  </button>
    </form>
    </div>
    </>
  )
}

export default AddProduct

export const getServerSideProps = async (context) => {
  const user_id = getUserIDFromCookie(context.req);
  const authToken = getAuthTokenFromCookie(context.req);
    return {
      props: {
        user_id,
        authToken,
      },
    };
};