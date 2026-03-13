import { validateCreateTag } from "../modules/tag/tag.validator.js";
import { validateCreateCategory } from "../modules/category/category.validator.js";
import { validateUpdateRole } from "../modules/role/role.validator.js";
import { validateUpdateUser } from "../modules/user/user.validator.js";
import { validateCreateFact } from "../modules/fact/fact.validator.js";
import { validateCreateFavourite } from "../modules/favourite/favourite.validator.js";
import { validateCreateComment } from "../modules/comment/comment.validator.js";
import { validateCreateReportFact } from "../modules/reportFact/reportFact.validator.js";
import { validateCreateBookmarkCollection } from "../modules/bookmarkCollection/bookmarkCollection.validator.js";
import { validateCreateCollectionFact } from "../modules/collectionFact/collectionFact.validator.js";

export const invalidFieldsCases = [
    { name: "tag validator", validator: validateCreateTag },
    { name: "category validator", validator: validateCreateCategory },
    { name: "role validator", validator: validateUpdateRole },
    { name: "user validator", validator: validateUpdateUser },
    { name: "fact validator", validator: validateCreateFact },
    { name: "favourite validator", validator: validateCreateFavourite },
    { name: "comment validator", validator: validateCreateComment },
    { name: "report fact validator", validator: validateCreateReportFact },
    { name: "bookmark collection validator", validator: validateCreateBookmarkCollection },
    { name: "collection fact validator", validator: validateCreateCollectionFact }
];
