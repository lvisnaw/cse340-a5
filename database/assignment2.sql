-- Insert cmd
INSERT INTO public.account (account_firstname, account_lastname, account_email, account_password)
VALUES ('Tony', 'Stark', 'tony@starkent.com', 'Iam1ronM@n');

-- Change account type
UPDATE public.account
SET account_type = 'admin'
WHERE account_id = 1;

-- Delete account
DELETE FROM public.account
WHERE account_id = '1';

-- Modify 'GM Hummer'
UPDATE public.inventory
SET inv_description = REPLACE(inv_description, 'small interiors', 'a huge interior')
WHERE inv_id = 10;

-- Display values via inner join
SELECT i.inv_make, i.inv_model, c.classification_name
FROM public.inventory AS i
INNER JOIN public.classification AS c ON i.classification_id = c.classification_id
WHERE c.classification_name = 'Sport';

-- Add '/vehicles' 
UPDATE public.inventory
SET 
    inv_image = REPLACE(inv_image, '/images/', '/images/vehicles/'), 
    inv_thumbnail = REPLACE(inv_thumbnail, '/images/', '/images/vehicles/');

